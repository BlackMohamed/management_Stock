// src/pages/alerts/StockMovementModal.tsx
import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface StockMovementModalProps {
  product: any;
  onAddMovement: (productId: string, quantity: number, type: 'entry' | 'exit') => void;
  onClose: () => void;
}

const StockMovementModal: React.FC<StockMovementModalProps> = ({ 
  product, 
  onAddMovement, 
  onClose 
}) => {
  const [type, setType] = useState<'entry' | 'exit'>('entry');
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (quantity <= 0) {
      setError('La quantité doit être supérieure à 0');
      return;
    }

    if (type === 'exit' && quantity > product.quantity) {
      setError(`Stock insuffisant. Maximum disponible: ${product.quantity}`);
      return;
    }

    setError(null);
    onAddMovement(product._id, quantity, type);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full animate-slide-in">
          <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-b">
            <h3 className="text-lg font-medium text-gray-900">
              Mouvement de stock
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6">
            <div className="mb-4">
              <h4 className="font-medium text-gray-900">{product.name}</h4>
              <p className="text-sm text-gray-500">{product.description || 'N/A'}</p>
            </div>

            <div className="flex items-center space-x-2 mb-4 text-sm">
              <span className="text-gray-500">Stock actuel:</span>
              <span 
                className={`font-medium ${
                  product.quantity < product.minStockAlert 
                    ? 'text-danger-600' 
                    : 'text-gray-900'
                }`}
              >
                {product.quantity}
              </span>

              <span className="text-gray-500 ml-2">Seuil minimum:</span>
              <span className="font-medium text-gray-900">{product.minStockAlert}</span>
            </div>

            {product.quantity < product.minStockAlert && (
              <div className="mb-4 flex items-center p-3 bg-warning-50 text-warning-800 rounded-md text-sm">
                <AlertTriangle size={16} className="mr-2 flex-shrink-0" />
                <p>
                  Ce produit est en dessous du seuil minimum de stock. Un réapprovisionnement est recommandé.
                </p>
              </div>
            )}

            {error && (
              <div className="mb-4 flex items-center p-3 bg-danger-50 text-danger-700 rounded-md text-sm">
                <AlertTriangle size={16} className="mr-2 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="form-label">Type de mouvement</label>
                <div className="flex space-x-4 mt-1">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="movementType"
                      value="entry"
                      checked={type === 'entry'}
                      onChange={() => setType('entry')}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    />
                    <span className="ml-2">Entrée (réapprovisionnement)</span>
                  </label>

                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="movementType"
                      value="exit"
                      checked={type === 'exit'}
                      onChange={() => setType('exit')}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    />
                    <span className="ml-2">Sortie</span>
                  </label>
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="quantity" className="form-label">
                  Quantité
                </label>
                <input
                  type="number"
                  id="quantity"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                  className="form-input"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-outline"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className={type === 'entry' ? 'btn-primary' : 'btn-warning'}
                >
                  {type === 'entry' ? 'Ajouter au stock' : 'Retirer du stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockMovementModal;