
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'gestionnaire'>('gestionnaire');
  const [error, setError] = useState<string | null>(null);
  
  const { state, register, clearError } = useAuth();
  
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validations
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    
    setError(null);
    await register(username, password, role);
  };
  
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-purple-50 via-white to-purple-50">
      {/* Left side with image/illustration */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-purple-600 to-purple-900 p-12 flex-col justify-between relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center">
            <Package size={32} className="text-purple-100" />
            <span className="ml-2 text-2xl font-bold text-white">StockPro</span>
          </div>
          <h1 className="mt-12 text-4xl font-bold text-white leading-tight">
            Système de Gestion <br />de Stock Intelligent
          </h1>
          <p className="mt-6 text-lg text-purple-100 leading-relaxed">
            Rejoignez-nous pour gérer efficacement votre inventaire, suivre les mouvements de stock, et recevoir des alertes en temps réel.
          </p>
          
          {/* Animated circles in background */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute w-64 h-64 rounded-full bg-purple-500 opacity-20 -top-20 -left-20 animate-pulse"></div>
            <div className="absolute w-96 h-96 rounded-full bg-purple-400 opacity-10 -bottom-32 -right-32 animate-pulse delay-1000"></div>
          </div>
          
          {/* Feature highlights */}
          <div className="mt-12 space-y-4">
            <div className="flex items-center space-x-3 text-purple-100">
              <div className="w-8 h-8 rounded-lg bg-purple-500 bg-opacity-30 flex items-center justify-center">
                ✓
              </div>
              <span>Suivi en temps réel</span>
            </div>
            <div className="flex items-center space-x-3 text-purple-100">
              <div className="w-8 h-8 rounded-lg bg-purple-500 bg-opacity-30 flex items-center justify-center">
                ✓
              </div>
              <span>Alertes intelligentes</span>
            </div>
            <div className="flex items-center space-x-3 text-purple-100">
              <div className="w-8 h-8 rounded-lg bg-purple-500 bg-opacity-30 flex items-center justify-center">
                ✓
              </div>
              <span>Rapports détaillés</span>
            </div>
          </div>
        </div>
        
        <div className="text-purple-200 text-sm relative z-10">
          © 2025 StockPro. Tous droits réservés.
        </div>
      </div>
      
      {/* Right side with register form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex items-center justify-center lg:hidden">
            <Package size={32} className="text-purple-600" />
            <span className="ml-2 text-2xl font-bold text-purple-600">StockPro</span>
          </div>
          
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Créer un compte
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ou{' '}
            <Link to="/login" className="font-medium text-purple-600 hover:text-purple-500 transition-colors">
              connectez-vous à votre compte
            </Link>
          </p>
        </div>
        
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-xl shadow-purple-100 sm:rounded-xl sm:px-10 transform transition-all duration-300 hover:scale-[1.01]">
            {(state.error || error) && (
              <div className="mb-6 flex items-center p-4 bg-red-50 text-red-700 rounded-lg animate-shake">
                <AlertCircle size={18} className="mr-2 flex-shrink-0" />
                <p className="text-sm">{state.error || error}</p>
              </div>
            )}
            
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-1">
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Nom d'utilisateur
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                  placeholder="votre_nom"
                />
              </div>
              
              <div className="space-y-1">
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  Rôle
                </label>
                <select
                  id="role"
                  name="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'admin' | 'gestionnaire')}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                >
                  <option value="gestionnaire">Gestionnaire</option>

                </select>
                
              </div>
              
              <div className="space-y-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Mot de passe
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                  placeholder="••••••••"
                />
              </div>
              
              <div className="space-y-1">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirmer le mot de passe
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                  placeholder="••••••••"
                />
              </div>
              
              <div>
                <button
                  type="submit"
                  disabled={state.loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 transform hover:scale-[1.02]"
                >
                  {state.loading ? (
                    <LoadingSpinner size="small" color="white" />
                  ) : (
                    'Créer un compte'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
// <option value="admin">Administrateur</option>
export default RegisterPage;