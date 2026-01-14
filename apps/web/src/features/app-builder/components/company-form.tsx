import type { CreateCompanyData, UpdateCompanyData } from '../../../lib/types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

interface CompanyFormProps {
  formData: CreateCompanyData | UpdateCompanyData;
  setFormData: (data: CreateCompanyData | UpdateCompanyData) => void;
  isEdit?: boolean;
}

export function CompanyForm({
  formData,
  setFormData,
  isEdit = false,
}: CompanyFormProps) {
  const isCreate = 'companyCode' in formData;

  return (
    <div className="space-y-6 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="companyCode">公司代碼</Label>
          <Input
            id="companyCode"
            value={
              isCreate ? (formData as CreateCompanyData).companyCode : undefined
            }
            onChange={(e) =>
              setFormData({ ...formData, companyCode: e.target.value })
            }
            placeholder="例如：TWSBP"
            disabled={isEdit}
            className="bg-muted/30"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="companyName">公司名稱</Label>
          <Input
            id="companyName"
            value={formData.companyName}
            onChange={(e) =>
              setFormData({ ...formData, companyName: e.target.value })
            }
            placeholder="例如：TWSBP"
          />
        </div>
      </div>

      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="active"
            checked={formData.isActive ?? true}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, isActive: checked })
            }
          />
          <Label htmlFor="active" className="cursor-pointer">
            啟用狀態
          </Label>
        </div>
        <span className="text-sm text-muted-foreground">
          {(formData.isActive ?? true) ? '公司將被啟用' : '公司將被停用'}
        </span>
      </div>
    </div>
  );
}
