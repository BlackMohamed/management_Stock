// src/pages/history/HistoryPage.tsx
import React, { useState, useEffect } from 'react';
import { History, ArrowUpRight, ArrowDownLeft, Calendar, Search, Package, ArrowUpDown } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const HistoryPage: React.FC = () => {
  const { state } = useAuth();
  const [movements, setMovements] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'entry' | 'exit'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'productName'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch movements from backend
  const fetchMovements = async () => {
    if (!state.isAuthenticated) {
      setError('Vous devez être connecté pour voir l\'historique.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/movements', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setMovements(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement de l\'historique');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, [state.isAuthenticated]);

  // Filter by search term and movement type
  const filteredMovements = movements.filter(movement => {
    const productName = movement.productName || (movement.productId?.name || '');
    const userName = movement.userName || (movement.userId?.username || '');
    const matchesSearch = 
      productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'all' || movement.type === filterType;

    return matchesSearch && matchesType;
  });

  // Sort movements
  const sortedMovements = [...filteredMovements].sort((a, b) => {
    const aValue = sortBy === 'date' ? new Date(a.date) : a.productName || a.productId?.name || '';
    const bValue = sortBy === 'date' ? new Date(b.date) : b.productName || b.productId?.name || '';

    if (sortBy === 'date') {
      return sortDirection === 'desc'
        ? bValue.getTime() - aValue.getTime()
        : aValue.getTime() - bValue.getTime();
    } else {
      return sortDirection === 'desc'
        ? (bValue as string).localeCompare(aValue as string)
        : (aValue as string).localeCompare(bValue as string);
    }
  });

  const toggleSort = (field: 'date' | 'productName') => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortDirection('desc');
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="large" color="purple" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="mb-6 flex items-center p-4 bg-red-50 text-red-700 rounded-lg animate-shake">
          <AlertTriangle size={18} className="mr-2 flex-shrink-0" />
          <p className="text-sm">{error}</p>
          <button
            onClick={() => {
              setError(null);
              fetchMovements();
            }}
            className="ml-4 text-purple-600 hover:text-purple-800"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center">
        <History size={24} className="text-primary-600 mr-2" />
        <h1 className="text-2xl font-bold text-gray-900">
          Historique des Mouvements de Stock
        </h1>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Rechercher un produit ou utilisateur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input pl-10"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as 'all' | 'entry' | 'exit')}
            className="form-input py-2 pr-10"
          >
            <option value="all">Tous les mouvements</option>
            <option value="entry">Entrées seulement</option>
            <option value="exit">Sorties seulement</option>
          </select>
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th onClick={() => toggleSort('date')} className="cursor-pointer">
                <div className="flex items-center">
                  <Calendar size={16} className="mr-1" />
                  Date
                  <ArrowUpDown size={14} className="ml-1" />
                </div>
              </th>
              <th onClick={() => toggleSort('productName')} className="cursor-pointer">
                <div className="flex items-center">
                  <Package size={16} className="mr-1" />
                  Produit
                  <ArrowUpDown size={14} className="ml-1" />
                </div>
              </th>
              <th>Type</th>
              <th>Quantité</th>
              <th>Utilisateur</th>
            </tr>
          </thead>
          <tbody>
            {sortedMovements.length > 0 ? (
              sortedMovements.map((movement) => (
                <tr key={movement._id || movement.id} className="hover:bg-gray-50">
                  <td>{formatDate(movement.date)}</td>
                  <td className="font-medium text-gray-900">{movement.productName || movement.productId?.name || 'N/A'}</td>
                  <td>
                    {movement.type === 'entry' ? (
                      <span className="badge-success flex items-center w-fit">
                        <ArrowDownLeft size={14} className="mr-1" />
                        Entrée
                      </span>
                    ) : (
                      <span className="badge-warning flex items-center w-fit">
                        <ArrowUpRight size={14} className="mr-1" />
                        Sortie
                      </span>
                    )}
                  </td>
                  <td className="font-medium">
                    {movement.type === 'entry' ? '+' : '-'}{movement.quantity}
                  </td>
                  <td>{movement.userName || movement.userId?.username || 'N/A'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  Aucun mouvement trouvé
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HistoryPage;