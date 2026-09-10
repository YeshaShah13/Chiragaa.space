<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use App\Traits\ApiResponse;

class SettingController extends Controller
{
    use ApiResponse;

    /**
     * Retrieve all settings, optionally filtered by category.
     */
    public function index(Request $request)
    {
        $query = Setting::query();

        if ($request->has('category')) {
            $query->where('category', $request->input('category'));
        }

        $settings = $query->get()->mapWithKeys(function ($setting) {
            return [$setting->key => $setting->typed_value];
        });

        // Also return full meta if requested
        if ($request->boolean('with_meta')) {
            $fullSettings = $query->get()->groupBy('category');
            return $this->success('Settings retrieved successfully', $fullSettings);
        }

        return $this->success('Settings retrieved successfully', $settings);
    }

    /**
     * Update multiple settings at once.
     */
    public function updateBatch(Request $request)
    {
        $validated = $request->validate([
            'settings' => 'required|array',
            'settings.*.key' => 'required|string',
            'settings.*.value' => 'nullable',
        ]);

        $updatedKeys = [];

        foreach ($validated['settings'] as $item) {
            $setting = Setting::where('key', $item['key'])->first();
            
            if ($setting) {
                // If value is null, save it as null, otherwise convert to appropriate type via mutator if we had one
                // For simplicity, we just set the value and type based on input type
                $setting->typed_value = $item['value'];
                $setting->save();
                
                $updatedKeys[] = $item['key'];
            }
        }

        return $this->success('Settings updated successfully', ['updated' => $updatedKeys]);
    }
}
