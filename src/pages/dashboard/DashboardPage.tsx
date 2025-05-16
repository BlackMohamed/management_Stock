// src/pages/dashboard/DashboardPage.tsx
import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, ArrowUpDown, AlertTriangle, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import axios from 'axios';
import ProductModal from './ProductModal';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const DashboardPage: React.FC = () => {
  const { state } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<any | null>(null);
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const fetchProducts = async (search?: string) => {
    if (!state.isAuthenticated) {
      setError('Vous devez être connecté pour voir les produits.');
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Token d\'authentification manquant. Veuillez vous reconnecter.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching products with token:', token, 'page:', currentPage, 'search:', search);
      const response = await axios.get('http://localhost:5000/products', {
        headers: { Authorization: `Bearer ${token}` },
        params: search
          ? { search: search } // Pass search term to backend
          : { page: currentPage, limit: productsPerPage }, // Pagination for normal view
      });
      console.log('Products response:', response.data);

      if (response.data && typeof response.data === 'object') {
        if (Array.isArray(response.data.products)) {
          setProducts(response.data.products);
          setTotalProducts(response.data.total || response.data.products.length);
        } else if (Array.isArray(response.data)) {
          setProducts(response.data);
          setTotalProducts(response.data.length);
          console.warn('Using legacy flat array response, consider updating backend to { products, total }');
        } else {
          throw new Error('Unexpected response format');
        }
      } else {
        throw new Error('Invalid response data');
      }
    } catch (err: any) {
      console.error('Fetch error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Erreur lors du chargement des produits');
      setProducts([]);
      setTotalProducts(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [state.isAuthenticated, currentPage, productsPerPage]);

  // Fetch products when search term changes
  useEffect(() => {
    fetchProducts(searchTerm);
  }, [searchTerm]);

  const filteredProducts = products.filter(
    product =>
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc'
        ? aValue - bValue
        : bValue - aValue;
    }
    return 0;
  });

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleAddProduct = () => {
    setCurrentProduct(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product: any) => {
    setCurrentProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteConfirm = (id: string) => {
    setProductToDelete(id);
    setShowDeleteConfirm(true);
  };

  const handleDeleteProduct = async () => {
    if (productToDelete) {
      try {
        await axios.delete(`http://localhost:5000/products/${productToDelete}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setProducts(products.filter(product => product._id !== productToDelete));
        setTotalProducts(prev => prev - 1);
        setShowDeleteConfirm(false);
        setProductToDelete(null);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Erreur lors de la suppression');
        setShowDeleteConfirm(false);
      }
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setProductToDelete(null);
  };

  const handleSaveProduct = async (product: any) => {
    try {
      if (currentProduct) {
        const response = await axios.put(
          `http://localhost:5000/products/${currentProduct._id}`,
          product,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        setProducts(products.map(p => (p._id === currentProduct._id ? response.data : p)));
      } else {
        const response = await axios.post('http://localhost:5000/products', product, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setProducts([...products, response.data]);
        setTotalProducts(prev => prev + 1);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la sauvegarde');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
    }).format(price);
  };

  const totalPages = Math.ceil(totalProducts / productsPerPage);
  const handlePreviousPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleNextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);

  const handleRefresh = () => {
    setSearchTerm(''); // Clear search term to reset to paginated view
    setCurrentPage(1); // Reset to first page
    fetchProducts(); // Fetch paginated products
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
              fetchProducts(searchTerm);
            }}
            className="ml-4 text-purple-600 hover:text-purple-800"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!sortedProducts.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-gray-500 mb-4">Aucun produit disponible.</p>
        <button
          onClick={handleRefresh}
          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <RefreshCw size={16} className="mr-2" />
          Rafraîchir les produits
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Produits</h1>
        <div className="mt-3 sm:mt-0 flex space-x-3">
          <button
            onClick={handleRefresh}
            className="inline-flex items-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 transform hover:scale-[1.02]"
          >
            <RefreshCw size={18} className="mr-1" />
            Rafraîchir
          </button>
          <button
            onClick={handleAddProduct}
            className="inline-flex items-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 transform hover:scale-[1.02]"
          >
            <Plus size={18} className="mr-1" />
            Ajouter un Produit
          </button>
        </div>
      </div>

      <div className="relative w-full max-w-xl">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Rechercher un produit..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 pl-10"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                onClick={() => handleSort('name')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                <div className="flex items-center">
                  Nom du produit
                  <ArrowUpDown size={14} className="ml-1" />
                </div>
              </th>
              <th
                onClick={() => handleSort('category')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                <div className="flex items-center">
                  Catégorie
                  <ArrowUpDown size={14} className="ml-1" />
                </div>
              </th>
              <th
                onClick={() => handleSort('price')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                <div className="flex items-center">
                  Prix
                  <ArrowUpDown size={14} className="ml-1" />
                </div>
              </th>
              <th
                onClick={() => handleSort('quantity')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                <div className="flex items-center">
                  Stock
                  <ArrowUpDown size={14} className="ml-1" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedProducts.map((product) => (
              <tr key={product._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{product.name}</div>
                  <div className="text-sm text-gray-500 truncate max-w-xs">{product.description || 'N/A'}</div>
                </td>
                <td className="px-6 py-4">{product.category}</td>
                <td className="px-6 py-4">{product.price ? formatPrice(product.price) : 'N/A'}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    {product.quantity < (product.minStockAlert || 0) && (
                      <AlertTriangle size={16} className="text-red-500 mr-1" />
                    )}
                    <span
                      className={
                        product.quantity < (product.minStockAlert || 0) ? 'text-red-700 font-medium' : 'text-gray-500'
                      }
                    >
                      {product.quantity}
                    </span>
                    <span className="text-gray-400 ml-1">/ {(product.minStockAlert || 0)} min</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="p-1 text-purple-600 hover:text-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-md"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteConfirm(product._id)}
                      className="p-1 text-red-600 hover:text-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 rounded-md"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalProducts > 0 && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-600">
            Affichage de {(currentPage - 1) * productsPerPage + 1} à{' '}
            {Math.min(currentPage * productsPerPage, totalProducts)} sur {totalProducts} produits
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg border border-gray-300 flex items-center ${
                currentPage === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <ChevronLeft size={16} className="mr-1" />
              Précédent
            </button>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg border border-gray-300 flex items-center ${
                currentPage === totalPages
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Suivant
              <ChevronRight size={16} className="ml-1" />
            </button>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h1 className="text-lg font-semibold text-gray-900 mb-4">Confirmation de suppression</h1>
            <p className="text-gray-600 mb-6">Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteProduct}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <ProductModal
          product={currentProduct}
          onSave={handleSaveProduct}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardPage;