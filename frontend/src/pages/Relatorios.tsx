// frontend/src/pages/Relatorios.tsx

export default function Relatorios() {
  return (
    <div className="p-6">
      <div className="flex flex-col items-start gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Relatórios</h1>
          <p className="mt-2 text-gray-600">
            Gere relatórios detalhados para uma visão aprofundada do seu negócio.
          </p>
        </div>
      </div>

      <div className="text-center py-10 border-2 border-dashed rounded-lg mt-6">
        <h3 className="text-lg font-medium">Módulo de Relatórios em Construção</h3>
        <p className="text-sm text-gray-500">
          Em breve, você poderá gerar seus relatórios aqui.
        </p>
      </div>
    </div>
  );
}
