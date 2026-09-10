<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Carbon;

class DbfReader {
    private $handle;
    private $headerLength;
    private $recordLength;
    private $recordCount;
    private $fields = [];

    public function __construct(string $filePath) {
        if (!file_exists($filePath)) {
            throw new \Exception("DBF file not found: {$filePath}");
        }
        $this->handle = fopen($filePath, 'rb');
        $this->readHeader();
    }

    private function readHeader() {
        $header = fread($this->handle, 32);
        $data = unpack('Cversion/Cyy/Cmm/Cdd/Vnum_records/vheader_len/vrecord_len', $header);
        $this->recordCount = $data['num_records'];
        $this->headerLength = $data['header_len'];
        $this->recordLength = $data['record_len'];

        while (true) {
            $char = fread($this->handle, 1);
            if ($char === "\r" || $char === "" || ord($char) === 0x0D) {
                break;
            }
            $fieldData = $char . fread($this->handle, 31);
            if (strlen($fieldData) < 32) break;

            $fName = rtrim(substr($fieldData, 0, 11), "\x00 ");
            $fType = substr($fieldData, 11, 1);
            $fLen = ord($fieldData[16]);
            $fDec = ord($fieldData[17]);

            $this->fields[] = [
                'name' => $fName,
                'type' => $fType,
                'len' => $fLen,
                'dec' => $fDec
            ];
        }

        fseek($this->handle, $this->headerLength);
    }

    public function getRecordCount(): int {
        return $this->recordCount;
    }

    public function getFields(): array {
        return $this->fields;
    }

    public function getRecord(int $index): ?array {
        fseek($this->handle, $this->headerLength + ($index * $this->recordLength));
        $recordBytes = fread($this->handle, $this->recordLength);
        if (strlen($recordBytes) < $this->recordLength) {
            return null;
        }

        $deleted = ($recordBytes[0] === '*');
        $record = ['_deleted' => $deleted];
        $offset = 1;

        foreach ($this->fields as $field) {
            $val = substr($recordBytes, $offset, $field['len']);
            $offset += $field['len'];
            $record[$field['name']] = trim(mb_convert_encoding($val, 'UTF-8', 'ISO-8859-1'));
        }

        return $record;
    }

    public function close() {
        if ($this->handle) {
            fclose($this->handle);
        }
    }
}

class MigrateDbfData extends Command
{
    protected $signature = 'migrate:dbf-data 
                            {--mmv= : Path to MMV.DBF} 
                            {--ins= : Path to ins.dbf}
                            {--fresh : Truncate motor and insurance tables before import}';

    protected $description = 'Migrate legacy MMV.DBF and ins.dbf data into MySQL database';

    private $makeCache = [];
    private $classCache = [];
    private $companyCache = [];
    private $vehicleMap = []; // vehicle_number => id

    public function handle()
    {
        ini_set('memory_limit', '2048M');
        set_time_limit(0);

        $mmvPath = $this->option('mmv') ?: 'c:/Users/user/OneDrive/Desktop/Chirags Insurance/MMV.DBF';
        $insPath = $this->option('ins') ?: 'c:/Users/user/OneDrive/Desktop/Chirags Insurance/ins.dbf';

        $this->info("=================================================");
        $this->info("Starting Legacy DBF Data Migration");
        $this->info("MMV File: " . $mmvPath);
        $this->info("INS File: " . $insPath);
        $this->info("=================================================");

        if ($this->option('fresh')) {
            $this->warn("Truncating existing motor and insurance data...");
            $this->truncateTables();
        }

        $startTime = microtime(true);

        // Load lookup caches
        $this->loadLookups();

        // 1. Process MMV.DBF
        if (file_exists($mmvPath)) {
            $this->processMmvFile($mmvPath);
        } else {
            $this->error("MMV.DBF not found at: {$mmvPath}");
        }

        // 2. Process ins.dbf
        if (file_exists($insPath)) {
            $this->processInsFile($insPath);
        } else {
            $this->error("ins.dbf not found at: {$insPath}");
        }

        $totalTime = round(microtime(true) - $startTime, 2);
        $this->info("=================================================");
        $this->info("Migration completed successfully in {$totalTime}s!");
        $this->info("Total Vehicles in DB: " . DB::table('vehicles')->count());
        $this->info("Total Insurance Policies in DB: " . DB::table('insurance_policies')->count());
        $this->info("Total Tax Records: " . DB::table('tax_records')->count());
        $this->info("Total Fitness Records: " . DB::table('fitness_records')->count());
        $this->info("Total Permits: " . DB::table('permits')->count());
        $this->info("Total National Permits: " . DB::table('national_permits')->count());
        $this->info("=================================================");

        return 0;
    }

    private function truncateTables()
    {
        Schema::disableForeignKeyConstraints();
        $tables = [
            'insurance_policies',
            'insurance_policy_nominees',
            'tax_records',
            'fitness_records',
            'permits',
            'national_permits',
            'vehicle_documents',
            'vehicle_notes',
            'vehicles',
        ];
        foreach ($tables as $tbl) {
            if (Schema::hasTable($tbl)) {
                DB::table($tbl)->truncate();
            }
        }
        Schema::enableForeignKeyConstraints();
    }

    private function loadLookups()
    {
        $this->info("Preloading lookup caches...");
        foreach (DB::table('vehicle_makes')->get() as $row) {
            $this->makeCache[strtoupper(trim($row->name))] = $row->id;
        }
        foreach (DB::table('vehicle_classes')->get() as $row) {
            $this->classCache[strtoupper(trim($row->name))] = $row->id;
        }
        foreach (DB::table('insurance_companies')->get() as $row) {
            $this->companyCache[strtoupper(trim($row->name))] = $row->id;
        }
        foreach (DB::table('vehicles')->select('id', 'vehicle_number')->get() as $row) {
            $this->vehicleMap[strtoupper(trim($row->vehicle_number))] = $row->id;
        }
    }

    private function getOrCreateMake(?string $makeName): ?int
    {
        $name = trim($makeName ?? '');
        if ($name === '') return null;
        $key = strtoupper($name);
        if (isset($this->makeCache[$key])) {
            return $this->makeCache[$key];
        }
        $id = DB::table('vehicle_makes')->insertGetId([
            'name' => $name,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $this->makeCache[$key] = $id;
        return $id;
    }

    private function getOrCreateClass(?string $className): ?int
    {
        $name = trim($className ?? '');
        if ($name === '') return null;
        $key = strtoupper($name);
        if (isset($this->classCache[$key])) {
            return $this->classCache[$key];
        }
        $id = DB::table('vehicle_classes')->insertGetId([
            'name' => $name,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $this->classCache[$key] = $id;
        return $id;
    }

    private function getOrCreateCompany(?string $compName): ?int
    {
        $name = trim($compName ?? '');
        if ($name === '') return null;
        $key = strtoupper($name);
        if (isset($this->companyCache[$key])) {
            return $this->companyCache[$key];
        }
        $id = DB::table('insurance_companies')->insertGetId([
            'name' => $name,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $this->companyCache[$key] = $id;
        return $id;
    }

    private function parseDbfDate(?string $dateStr): ?string
    {
        if (empty($dateStr)) return null;
        $clean = preg_replace('/[^0-9]/', '', $dateStr);
        if (strlen($clean) === 8 && $clean !== '00000000') {
            $y = (int)substr($clean, 0, 4);
            $m = (int)substr($clean, 4, 2);
            $d = (int)substr($clean, 6, 2);
            if ($y >= 1950 && $y <= 2040 && $m >= 1 && $m <= 12 && $d >= 1 && $d <= 31) {
                if (checkdate($m, $d, $y)) {
                    return sprintf('%04d-%02d-%02d', $y, $m, $d);
                }
            }
        }
        return null;
    }

    private function parseDecimal(?string $val, $default = null)
    {
        if ($val === null || $val === '') return $default;
        $num = floatval(str_replace(',', '', trim($val)));
        return is_nan($num) ? $default : $num;
    }

    private function parseInt(?string $val, $default = null)
    {
        if ($val === null || $val === '') return $default;
        $num = intval(preg_replace('/[^0-9\-]/', '', trim($val)));
        return $num;
    }

    private function processMmvFile(string $filePath)
    {
        $this->info("Parsing MMV.DBF...");
        $reader = new DbfReader($filePath);
        $total = $reader->getRecordCount();
        $this->info("Total Records in MMV: {$total}");

        $taxBatch = [];
        $fitBatch = [];
        $perBatch = [];
        $npBatch = [];

        $chunkSize = 1000;
        $importedCount = 0;
        $now = now()->toDateTimeString();

        for ($i = 0; $i < $total; $i++) {
            $r = $reader->getRecord($i);
            if (!$r || $r['_deleted']) {
                continue;
            }

            $vno = strtoupper(trim($r['MMV_NO']));
            $trmmv = strtoupper(trim($r['TRMMV_NO']));
            
            if ($vno === '' && $trmmv !== '') {
                $vno = $trmmv;
            }
            if ($vno === '') {
                $chassis = preg_replace('/[^A-Z0-9]/', '', strtoupper(trim($r['CHASIS_NO'])));
                $vno = $chassis !== '' ? "UNREG-{$chassis}" : "UNREG-MMV-" . ($i + 1);
            }

            $ownerName = trim($r['NAME']) ?: 'Unknown Owner';
            $makeId = $this->getOrCreateMake($r['MAKE']);
            $classId = $this->getOrCreateClass($r['CLASS']);

            // Full combined address
            $addressParts = array_filter([
                trim($r['ADD1'] ?? ''),
                trim($r['ADD2'] ?? ''),
                trim($r['ADD3'] ?? ''),
                trim($r['ADD4'] ?? ''),
                trim($r['CITY'] ?? ''),
            ]);
            $permAddress = implode(', ', $addressParts) ?: null;

            // Remarks
            $remarkParts = array_filter([
                trim($r['REMARK'] ?? ''),
                trim($r['REMARK1'] ?? ''),
            ]);
            $remarks = implode(' | ', $remarkParts) ?: null;

            $rlw = $this->parseDecimal($r['RLW'], null);
            $uw = $this->parseDecimal($r['UW'], null);
            $plw = $this->parseDecimal($r['PLW'], null);
            if ($plw === null && $rlw !== null && $uw !== null) {
                $plw = $rlw - $uw;
            }

            $vehicleData = [
                'vehicle_number' => $vno,
                'troli_no' => $trmmv ?: null,
                'owner_name' => $ownerName,
                'phone' => null,
                'registration_date' => $this->parseDbfDate($r['REG_DATE']),
                'tractor_registration_date' => $this->parseDbfDate($r['TREG_DATE']),
                'permanent_address' => $permAddress,
                'make_id' => $makeId,
                'class_id' => $classId,
                'model' => trim($r['MODAL']) ?: null,
                'engine_number' => trim($r['ENGINEE_NO']) ?: null,
                'chassis_number' => trim($r['CHASIS_NO']) ?: null,
                'horse_power' => trim($r['H_P']) ?: null,
                'cylinder' => trim($r['CYLINDER']) ?: null,
                's_c_ind' => trim($r['S_C_IND']) ?: null,
                'rlw' => $rlw,
                'uw' => $uw,
                'plw' => $plw,
                'hpa_with' => trim($r['HPA']) ?: null,
                'remarks' => $remarks,
                'group' => trim($r['GRP']) ?: null,
                'status' => 'Active',
                'created_at' => $now,
                'updated_at' => $now,
            ];

            // Insert or Update Vehicle safely
            $vehicleId = null;
            if (isset($this->vehicleMap[$vno])) {
                $vehicleId = $this->vehicleMap[$vno];
                DB::table('vehicles')->where('id', $vehicleId)->update($vehicleData);
            } else {
                $existing = DB::table('vehicles')->where('vehicle_number', $vno)->value('id');
                if ($existing) {
                    $vehicleId = $existing;
                    DB::table('vehicles')->where('id', $vehicleId)->update($vehicleData);
                } else {
                    try {
                        $vehicleId = DB::table('vehicles')->insertGetId($vehicleData);
                    } catch (\Exception $ex) {
                        $vehicleId = DB::table('vehicles')->where('vehicle_number', $vno)->value('id');
                        if ($vehicleId) {
                            DB::table('vehicles')->where('id', $vehicleId)->update($vehicleData);
                        } else {
                            $vehicleData['vehicle_number'] = $vno . '-DUP-' . ($i + 1);
                            $vehicleId = DB::table('vehicles')->insertGetId($vehicleData);
                        }
                    }
                }
                $this->vehicleMap[$vno] = $vehicleId;
            }

            $importedCount++;

            // Tax Record
            $taxUDate = $this->parseDbfDate($r['TAX_U_DATE']);
            $taxPDate = $this->parseDbfDate($r['TAX_P_DATE']);
            $taxAmount = $this->parseDecimal($r['TAX_RS'], 0);
            if ($taxUDate || $taxPDate || $taxAmount > 0) {
                $taxBatch[] = [
                    'vehicle_id' => $vehicleId,
                    'valid_upto' => $taxUDate ?: ($taxPDate ?: $now),
                    'paid_date' => $taxPDate,
                    'amount' => $taxAmount,
                    'receipt_number' => trim($r['TAX_R_NO']) ?: null,
                    'penalty' => $this->parseDecimal($r['TAX_PEN'], 0),
                    'interest' => $this->parseDecimal($r['TAX_INT'], 0),
                    'yearly' => ($r['TAX_YR1'] === 'T' || $r['TAX_YR1'] === '1' || $r['TAX_YR1'] === 'Y'),
                    'yearly_amount' => $this->parseDecimal($r['TAX_YR'], 0),
                    'half_yearly' => ($r['TAX_HYR1'] === 'T' || $r['TAX_HYR1'] === '1' || $r['TAX_HYR1'] === 'Y'),
                    'half_yearly_amount' => $this->parseDecimal($r['TAX_HYR'], 0),
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }

            // Fitness Record
            $fitUDate = $this->parseDbfDate($r['FIT_U_DATE']);
            if ($fitUDate) {
                $fitBatch[] = [
                    'vehicle_id' => $vehicleId,
                    'expiry_date' => $fitUDate,
                    'passed_by' => trim($r['FIT_PAS_BY']) ?: null,
                    'place' => trim($r['FIT_PLACE']) ?: null,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }

            // Permit Record
            $perUDate = $this->parseDbfDate($r['PER_U_DATE']);
            $perDate = $this->parseDbfDate($r['PER_DATE']);
            $perNo = trim($r['PER_NO']);
            if ($perUDate || $perDate || $perNo !== '') {
                $perBatch[] = [
                    'vehicle_id' => $vehicleId,
                    'permit_number' => $perNo ?: 'N/A',
                    'expiry_date' => $perUDate ?: ($perDate ?: $now),
                    'issue_date' => $perDate,
                    'amount' => $this->parseDecimal($r['PER_RS'], 0),
                    'receipt_no' => trim($r['PER_REC_NO']) ?: null,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }

            // National Permit Record
            $npUDate = $this->parseDbfDate($r['NP_U_DATE']);
            $npState = trim($r['NP_STATE']);
            if ($npUDate || $npState !== '') {
                $pAddress = implode(', ', array_filter([
                    trim($r['P_ADD1'] ?? ''),
                    trim($r['P_ADD2'] ?? ''),
                    trim($r['P_ADD3'] ?? ''),
                    trim($r['P_ADD4'] ?? ''),
                ])) ?: null;

                $npBatch[] = [
                    'vehicle_id' => $vehicleId,
                    'expiry_date' => $npUDate ?: $now,
                    'state_info' => $npState ?: null,
                    'address' => $pAddress,
                    'city' => trim($r['P_CITY']) ?: null,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }

            // Batch Inserts for compliance tables
            if (count($taxBatch) >= $chunkSize) {
                DB::table('tax_records')->insert($taxBatch);
                $taxBatch = [];
            }
            if (count($fitBatch) >= $chunkSize) {
                DB::table('fitness_records')->insert($fitBatch);
                $fitBatch = [];
            }
            if (count($perBatch) >= $chunkSize) {
                DB::table('permits')->insert($perBatch);
                $perBatch = [];
            }
            if (count($npBatch) >= $chunkSize) {
                DB::table('national_permits')->insert($npBatch);
                $npBatch = [];
            }

            if ($i > 0 && $i % 5000 === 0) {
                $this->line("Processed {$i} / {$total} MMV records...");
            }
        }

        // Flush remaining batches
        if (!empty($taxBatch)) DB::table('tax_records')->insert($taxBatch);
        if (!empty($fitBatch)) DB::table('fitness_records')->insert($fitBatch);
        if (!empty($perBatch)) DB::table('permits')->insert($perBatch);
        if (!empty($npBatch)) DB::table('national_permits')->insert($npBatch);

        $reader->close();
        $this->info("Completed MMV.DBF migration: {$importedCount} vehicles imported/updated.");
    }

    private function processInsFile(string $filePath)
    {
        $this->info("Parsing ins.dbf...");
        $reader = new DbfReader($filePath);
        $total = $reader->getRecordCount();
        $this->info("Total Records in INS: {$total}");

        $policyBatch = [];
        $chunkSize = 1000;
        $importedCount = 0;
        $now = now()->toDateTimeString();

        for ($i = 0; $i < $total; $i++) {
            $r = $reader->getRecord($i);
            if (!$r || $r['_deleted']) {
                continue;
            }

            $vno = strtoupper(trim($r['MV_NO']));
            if ($vno === '') {
                $trmv = strtoupper(trim($r['TRMV_NO']));
                $vno = $trmv !== '' ? $trmv : "UNREG-INS-" . ($i + 1);
            }

            // Ensure vehicle exists
            $vehicleId = null;
            if (isset($this->vehicleMap[$vno])) {
                $vehicleId = $this->vehicleMap[$vno];
            } else {
                $existing = DB::table('vehicles')->where('vehicle_number', $vno)->value('id');
                if ($existing) {
                    $vehicleId = $existing;
                    $this->vehicleMap[$vno] = $vehicleId;
                } else {
                    $makeId = $this->getOrCreateMake($r['MAKE']);
                    $ownerName = trim($r['NAME']) ?: 'Unknown Owner';
                    
                    $addressParts = array_filter([
                        trim($r['ADD1'] ?? ''),
                        trim($r['ADD2'] ?? ''),
                        trim($r['ADD3'] ?? ''),
                        trim($r['ADD4'] ?? ''),
                        trim($r['CITY'] ?? ''),
                    ]);
                    $permAddress = implode(', ', $addressParts) ?: null;

                    $vInsertData = [
                        'vehicle_number' => $vno,
                        'troli_no' => trim($r['TRMV_NO']) ?: null,
                        'owner_name' => $ownerName,
                        'phone' => trim($r['PHONE'] ?? ($r['MOBILE1'] ?? ($r['MOBILE2'] ?? ''))) ?: null,
                        'registration_date' => $this->parseDbfDate($r['REG_DATE']),
                        'permanent_address' => $permAddress,
                        'make_id' => $makeId,
                        'model' => trim($r['MODAL']) ?: null,
                        'engine_number' => trim($r['ENG_NO']) ?: null,
                        'chassis_number' => trim($r['CHASIS_NO']) ?: null,
                        'horse_power' => trim($r['HP']) ?: null,
                        's_c_ind' => trim($r['SEAT_CAP']) ?: null,
                        'rlw' => $this->parseDecimal($r['RLW'], null),
                        'hpa_with' => trim($r['HPA']) ?: null,
                        'remarks' => trim($r['REMARK']) ?: null,
                        'group' => trim($r['GRP']) ?: null,
                        'status' => 'Active',
                        'created_at' => $now,
                        'updated_at' => $now,
                    ];

                    try {
                        $vehicleId = DB::table('vehicles')->insertGetId($vInsertData);
                    } catch (\Exception $ex) {
                        $vehicleId = DB::table('vehicles')->where('vehicle_number', $vno)->value('id');
                        if (!$vehicleId) {
                            $vInsertData['vehicle_number'] = $vno . '-INS-' . ($i + 1);
                            $vehicleId = DB::table('vehicles')->insertGetId($vInsertData);
                        }
                    }
                    $this->vehicleMap[$vno] = $vehicleId;
                }
            }

            $companyId = $this->getOrCreateCompany($r['COMP']);
            $policyNumber = trim($r['POLICY_NO']) ?: 'POL-' . ($i + 1);
            $expDate = $this->parseDbfDate($r['EXP_DATE']);
            $recDate = $this->parseDbfDate($r['REC_DATE']);
            $confDate = $this->parseDbfDate($r['CONF_DATE']);
            $tranDate = $this->parseDbfDate($r['TRAN_DATE']);

            // Calculate start_date
            $startDate = $recDate;
            if (!$startDate && $expDate) {
                $startDate = Carbon::parse($expDate)->subYear()->addDay()->format('Y-m-d');
            }
            if (!$startDate) {
                $startDate = $now;
            }
            if (!$expDate) {
                $expDate = Carbon::parse($startDate)->addYear()->subDay()->format('Y-m-d');
            }

            $totalPrem = $this->parseDecimal($r['TOTAL_PREM'], 0);
            $netPrem = $this->parseDecimal($r['NET_PREM'], 0);
            $odPrem = $this->parseDecimal($r['OD_PREM'], 0);
            $sumIns = $this->parseDecimal($r['SUM_INS'], 0);
            $tSumIns = $this->parseDecimal($r['TSUM_INS'], 0);
            $oSumIns = $this->parseDecimal($r['OSUM_INS'], 0);
            $serTax = $this->parseDecimal($r['SER_TAX'], 0);
            $ncbVal = trim($r['N_C_B']) ?: null;

            $isActive = $expDate ? Carbon::parse($expDate)->isFuture() : true;

            $policyBatch[] = [
                'vehicle_id' => $vehicleId,
                'insurance_company_id' => $companyId,
                'policy_number' => $policyNumber,
                'receipt_number' => trim($r['REC_NO']) ?: null,
                'start_date' => $startDate,
                'expiry_date' => $expDate,
                'total_premium' => $totalPrem,
                'od_tp_premium' => $netPrem ?: $odPrem,
                'sum_insured' => $sumIns,
                'trolley_amount' => $tSumIns,
                'other_amount' => $oSumIns,
                'ncb' => $ncbVal,
                'service_tax' => $serTax,
                'confirmation_number' => trim($r['CONF_NO']) ?: null,
                'confirmation_date' => $confDate,
                'transfer_date' => $tranDate,
                'group_name' => trim($r['GRP']) ?: null,
                'hpa_with' => trim($r['HPA']) ?: null,
                'remarks' => trim($r['REMARK']) ?: null,
                'is_active' => $isActive,
                'created_at' => $now,
                'updated_at' => $now,
            ];

            $importedCount++;

            if (count($policyBatch) >= $chunkSize) {
                DB::table('insurance_policies')->insert($policyBatch);
                $policyBatch = [];
            }

            if ($i > 0 && $i % 10000 === 0) {
                $this->line("Processed {$i} / {$total} Insurance records...");
            }
        }

        if (!empty($policyBatch)) {
            DB::table('insurance_policies')->insert($policyBatch);
        }

        $reader->close();
        $this->info("Completed ins.dbf migration: {$importedCount} policies imported.");
    }
}
