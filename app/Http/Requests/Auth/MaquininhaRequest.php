<?php
namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class MaquininhaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nome' => ['required', 'string', 'max:100'],
            'modelo' => ['required', 'string', 'in:PagSeguro,Cielo,Stone,Rede,Getnet'],
            'status' => ['required', 'in:ativa,inativa'],
        ];
    }
}
