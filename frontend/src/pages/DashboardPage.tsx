import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <nav className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                Caçapa
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-slate-300">Olá, {user?.name}</span>
              <Link
                to="/pool"
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-md hover:from-purple-500 hover:to-pink-500 transition-all"
              >
                🎱 Jogar Caçapa
              </Link>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8">
            <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              Dashboard
            </h2>
            <p className="text-slate-300 text-lg mb-6">
              Bem-vindo, {user?.name}! Você está logado com sucesso.
            </p>
            {user?.email && (
              <p className="text-slate-400 mb-6">Email: {user.email}</p>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Link
                to="/pool"
                className="group bg-slate-700/50 border border-slate-600 rounded-xl p-6 hover:border-purple-500 hover:bg-slate-700 transition-all"
              >
                <div className="text-4xl mb-2">🎱</div>
                <h3 className="text-xl font-bold text-amber-300 group-hover:text-amber-200 transition-colors">
                  Caçapa
                </h3>
                <p className="text-slate-400 mt-2">
                  8 tacadas por round. Cada caçapa aumenta o multiplicador.
                  Poker hands dão bônus. Compre modificadores na loja!
                </p>
              </Link>

              <div className="bg-slate-700/50 border border-slate-600 rounded-xl p-6 opacity-50">
                <div className="text-4xl mb-2">🔒</div>
                <h3 className="text-xl font-bold text-slate-400">Em Breve</h3>
                <p className="text-slate-500 mt-2">Novos modos de jogo</p>
              </div>

              <div className="bg-slate-700/50 border border-slate-600 rounded-xl p-6 opacity-50">
                <div className="text-4xl mb-2">🏆</div>
                <h3 className="text-xl font-bold text-slate-400">Leaderboard</h3>
                <p className="text-slate-500 mt-2">Ranking global</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}