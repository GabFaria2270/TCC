<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class SocialLoginCallbackRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'state' => ['nullable', 'string'],
            'code' => ['required_without:error', 'string'],
            'error' => ['nullable', 'string'],
        ];
    }
}
