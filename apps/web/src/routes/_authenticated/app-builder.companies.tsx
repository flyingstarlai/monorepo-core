import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useMutation } from '@tanstack/react-query';
import {
  useCompanies,
  useCreateCompany,
} from '@/features/app-builder/hooks/use-app-builder';
import { api } from '@/lib/api-client';
import { CompanyDataTable } from '@/features/app-builder/components/company-data-table';
import { createCompanyTableColumns } from '@/features/app-builder/components/company-table-columns';
import { useCompanyTableActions } from '@/features/app-builder/components/company-table-actions';
import { CompanyForm } from '@/features/app-builder/components/company-form';
import type {
  Company,
  UpdateCompanyData,
  CreateCompanyData,
} from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus } from 'lucide-react';

export const Route = createFileRoute('/_authenticated/app-builder/companies')({
  component: CompaniesPage,
});

function CompaniesPage() {
  const { data: companies, isLoading, error, refetch } = useCompanies();
  const createCompany = useCreateCompany();
  const updateCompanyMutation = useMutation({
    mutationFn: async ({
      companyCode,
      data,
    }: {
      companyCode: string;
      data: UpdateCompanyData;
    }): Promise<Company> => {
      const response = await api.put<Company>(
        `/app-builder/companies/${companyCode}`,
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      refetch();
    },
  });

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  const [formData, setFormData] = useState<
    CreateCompanyData | UpdateCompanyData
  >({
    companyCode: '',
    companyName: '',
    isActive: true,
  });

  const dummyCompany: Company = {
    companyCode: '',
    companyName: '',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const { handleEdit, DeleteDialog } = useCompanyTableActions({
    company: dummyCompany,
    onRefresh: refetch,
    onEdit: (company) => {
      setEditingCompany(company);
      setFormData({
        companyName: company.companyName,
        isActive: company.isActive,
      });
      setIsEditOpen(true);
    },
    onDelete: undefined,
  });

  const columns = createCompanyTableColumns({
    onEdit: handleEdit,
    onDelete: undefined,
  });

  const handleCreate = async () => {
    try {
      const createData: CreateCompanyData = {
        companyCode: (formData as CreateCompanyData).companyCode || '',
        companyName: (formData as CreateCompanyData).companyName || '',
        isActive: formData.isActive,
      };
      await createCompany.mutateAsync(createData);
      setIsCreateOpen(false);
      setFormData({
        companyCode: '',
        companyName: '',
        isActive: true,
      });
    } catch (error) {
      console.error('Failed to create company:', error);
    }
  };

  const handleUpdate = async () => {
    if (!editingCompany) return;
    try {
      const updateData: UpdateCompanyData = {
        companyName:
          typeof formData.companyName === 'string'
            ? formData.companyName
            : undefined,
        isActive: formData.isActive,
      };
      await updateCompanyMutation.mutateAsync({
        companyCode: editingCompany.companyCode,
        data: updateData,
      });
      setIsEditOpen(false);
      setEditingCompany(null);
    } catch (error) {
      console.error('Failed to update company:', error);
    }
  };

  if (error) {
    return (
      <div className="p-4">
        <p className="text-destructive">
          Failed to load companies: {String(error)}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl flex-1">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">公司管理</h1>
            <p className="text-slate-600 mt-2">管理組織架構中的公司結構。</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleCreate}>
                <Plus className="mr-2 h-4 w-4" />
                新增公司
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>新增公司</DialogTitle>
              </DialogHeader>
              <CompanyForm
                formData={formData}
                setFormData={setFormData}
                isEdit={false}
              />
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                >
                  取消
                </Button>
                <Button onClick={handleCreate}>新增公司</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {editingCompany && (
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>編輯公司</DialogTitle>
                </DialogHeader>
                <CompanyForm
                  formData={formData}
                  setFormData={setFormData}
                  isEdit={true}
                />
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditOpen(false)}
                  >
                    取消
                  </Button>
                  <Button onClick={handleUpdate}>儲存變更</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Table */}
        <CompanyDataTable
          data={companies}
          isLoading={isLoading}
          columns={columns}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteDialog />
      </div>
    </div>
  );
}
