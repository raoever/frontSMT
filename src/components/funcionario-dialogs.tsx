import React from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';

interface DemissaoDialogProps {
  showDialog: boolean;
  setShowDialog: (show: boolean) => void;
  form: {
    nome: string;
    dataAdmissao: string;
    dataDemissao: string;
  };
  setForm: (form: any) => void;
  onSubmit: () => void;
}

export function DemissaoDialog({ 
  showDialog, 
  setShowDialog, 
  form, 
  setForm, 
  onSubmit 
}: DemissaoDialogProps) {
  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Funcionário Demitido</DialogTitle>
          <DialogDescription>
            Preencha os dados do funcionário para adicionar todos os itens de demissão relacionados.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="nome-funcionario-demissao">Nome do Funcionário</Label>
            <Input
              id="nome-funcionario-demissao"
              value={form.nome}
              onChange={(e) => setForm(prev => ({ ...prev, nome: e.target.value }))}
              placeholder="Nome completo do funcionário"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="data-admissao-demissao">Data de Admissão</Label>
            <Input
              id="data-admissao-demissao"
              type="date"
              value={form.dataAdmissao}
              onChange={(e) => setForm(prev => ({ ...prev, dataAdmissao: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="data-demissao">Data de Demissão</Label>
            <Input
              id="data-demissao"
              type="date"
              value={form.dataDemissao}
              onChange={(e) => setForm(prev => ({ ...prev, dataDemissao: e.target.value }))}
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button 
              onClick={onSubmit}
              className="flex-1 bg-blue-700 hover:bg-blue-800"
            >
              Adicionar
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowDialog(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface AdmissaoDialogProps {
  showDialog: boolean;
  setShowDialog: (show: boolean) => void;
  form: {
    nome: string;
    dataAdmissao: string;
  };
  setForm: (form: any) => void;
  onSubmit: () => void;
}

export function AdmissaoDialog({ 
  showDialog, 
  setShowDialog, 
  form, 
  setForm, 
  onSubmit 
}: AdmissaoDialogProps) {
  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Funcionário Admitido</DialogTitle>
          <DialogDescription>
            Preencha os dados do funcionário para adicionar todos os itens de admissão relacionados.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="nome-funcionario-admissao">Nome do Funcionário</Label>
            <Input
              id="nome-funcionario-admissao"
              value={form.nome}
              onChange={(e) => setForm(prev => ({ ...prev, nome: e.target.value }))}
              placeholder="Nome completo do funcionário"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="data-admissao">Data de Admissão</Label>
            <Input
              id="data-admissao"
              type="date"
              value={form.dataAdmissao}
              onChange={(e) => setForm(prev => ({ ...prev, dataAdmissao: e.target.value }))}
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button 
              onClick={onSubmit}
              className="flex-1 bg-blue-700 hover:bg-blue-800"
            >
              Adicionar
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowDialog(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface TransferenciaDialogProps {
  showDialog: boolean;
  setShowDialog: (show: boolean) => void;
  form: {
    nome: string;
    dataTransferencia: string;
    obraOrigem: string;
    obraDestino: string;
  };
  setForm: (form: any) => void;
  onSubmit: () => void;
}

export function TransferenciaDialog({ 
  showDialog, 
  setShowDialog, 
  form, 
  setForm, 
  onSubmit 
}: TransferenciaDialogProps) {
  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Funcionário Transferido</DialogTitle>
          <DialogDescription>
            Preencha os dados do funcionário para adicionar todos os itens de transferência relacionados.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="nome-funcionario-transferencia">Nome do Funcionário</Label>
            <Input
              id="nome-funcionario-transferencia"
              value={form.nome}
              onChange={(e) => setForm(prev => ({ ...prev, nome: e.target.value }))}
              placeholder="Nome completo do funcionário"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="data-transferencia">Data de Transferência</Label>
            <Input
              id="data-transferencia"
              type="date"
              value={form.dataTransferencia}
              onChange={(e) => setForm(prev => ({ ...prev, dataTransferencia: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="obra-origem">Obra de Origem</Label>
            <Input
              id="obra-origem"
              value={form.obraOrigem}
              onChange={(e) => setForm(prev => ({ ...prev, obraOrigem: e.target.value }))}
              placeholder="Nome da obra de origem"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="obra-destino">Obra de Destino</Label>
            <Input
              id="obra-destino"
              value={form.obraDestino}
              onChange={(e) => setForm(prev => ({ ...prev, obraDestino: e.target.value }))}
              placeholder="Nome da obra de destino"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button 
              onClick={onSubmit}
              className="flex-1 bg-blue-700 hover:bg-blue-800"
            >
              Adicionar
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowDialog(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}