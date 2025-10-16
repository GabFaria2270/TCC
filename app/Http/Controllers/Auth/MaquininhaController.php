<?php
namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Maquininha;
use App\Http\Requests\Auth\MaquininhaRequest;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class MaquininhaController extends Controller
{
    public function index()
    {
        // Busca o comércio do usuário logado
        $comercio = \App\Models\Comercio::where('usuario_id', Auth::id())->first();
        $maquininhas = [];
        if ($comercio) {
            $maquininhas = Maquininha::where('comercio_id', $comercio->id)->get()
                ->map(function($m) use ($comercio) {
                    $m->comercio = $comercio->nome;
                    return $m;
                });
        }
        return Inertia::render('gerenciamento/MaquininhasPage', [
            'maquininhas' => $maquininhas
        ]);
    }

    public function store(MaquininhaRequest $request)
    {
        $data = $request->validated();
        // Busca o comércio vinculado ao usuário logado
        $comercio = \App\Models\Comercio::where('usuario_id', Auth::id())->first();
        if (!$comercio) {
            return redirect()->back()->withErrors(['comercio' => 'Comércio não encontrado para o usuário logado.']);
        }
        $data['comercio_id'] = $comercio->id;
        Maquininha::create($data);
        return redirect()->route('maquininhas.index')
            ->with('success', 'Maquininha cadastrada com sucesso! 🎉');
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
