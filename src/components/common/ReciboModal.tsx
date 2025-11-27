import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { CheckCircle, Printer } from 'lucide-react';

interface ReciboModalProps {
  isOpen: boolean;
  onClose: () => void;
  recibo: any;
}

export const ReciboModal: React.FC<ReciboModalProps> = ({ isOpen, onClose, recibo }) => {
  const handlePrint = () => {
    window.print();
  };

  if (!recibo) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-500" />
            Recibo de Préstamo
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 p-6 bg-gray-50 rounded-lg">
          <div className="text-center border-b pb-4">
            <h3 className="text-lg">Sistema de Gestión de Biblioteca</h3>
            <p className="text-sm text-gray-600">Recibo de Préstamo</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Nº Recibo:</span>
              <span>{recibo.numero}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Fecha:</span>
              <span>{new Date(recibo.fecha).toLocaleString('es-ES')}</span>
            </div>

            <div className="border-t pt-2 mt-2">
              <h4 className="text-sm mb-2">Datos del Cliente</h4>
              <div className="flex justify-between">
                <span className="text-gray-600">Nombre:</span>
                <span>{recibo.cliente}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Identificación:</span>
                <span>{recibo.identificacion}</span>
              </div>
            </div>

            <div className="border-t pt-2 mt-2">
              <h4 className="text-sm mb-2">Datos del Libro</h4>
              <div className="flex justify-between">
                <span className="text-gray-600">Título:</span>
                <span>{recibo.libro}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Autor:</span>
                <span>{recibo.autor}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ID Libro:</span>
                <span>{recibo.libroId}</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-3 rounded text-sm text-center">
            <p>Por favor, devuelva el libro en buen estado.</p>
            <p>Evite multas devolviendo a tiempo.</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handlePrint} variant="outline" className="flex-1">
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
          <Button onClick={onClose} className="flex-1">
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
