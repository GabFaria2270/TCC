<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class LogoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'all_devices' => ['sometimes', 'boolean'],
        ];
    }

    public function wantsAllDevices(): bool
    {
        $val = $this->input('all_devices', true);
        return filter_var($val, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) ?? (bool) $val;
    }
}
