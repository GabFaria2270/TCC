<?php
namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Maquininha;
use App\Http\Requests\Auth\MaquininhaRequest;
use Inertia\Inertia;

class MaquininhaController extends Controller
{
    public function index()
    {
        $maquininhas = Maquininha::where('comercio_id', auth()->user()->comercio_id)->get();
        return Inertia::render('gerenciamento/MaquininhasPage', [
            'maquininhas' => $maquininhas
        ]);
    }

    public function store(MaquininhaRequest $request)
    {
        $data = $request->validated();
        $data['comercio_id'] = auth()->user()->comercio_id;
        Maquininha::create($data);
        return redirect()->route('maquininhas.index');
    }

    public function update(MaquininhaRequest $request, Maquininha $maquininha)
    {
        $maquininha->update($request->validated());
        return redirect()->route('maquininhas.index');
    }

    public function destroy(Maquininha $maquininha)
    {
        $maquininha->delete();
        return redirect()->route('maquininhas.index');
    }
}
