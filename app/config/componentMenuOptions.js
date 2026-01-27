import { Download, PackageX, Trash2, AlertCircle } from 'lucide-react';


export const getComponentMenuOptions = (handleOpenActionModal, item) => {
  return [
    {
      label: 'Install',
      icon: Download,
      onClick: () => {
        handleOpenActionModal('Install', item);
      }
    },
    {
      label: 'Uninstall',
      icon: PackageX,
      onClick: () => {
        handleOpenActionModal('Uninstall', item);
      }
    },
    {
      label: 'Scrap',
      icon: Trash2,
      onClick: () => {
        handleOpenActionModal('Scrap', item);
      }
    },
    {
      label: 'Lost',
      icon: AlertCircle,
      onClick: () => {
        handleOpenActionModal('Lost', item);
      }
    }
  ];
};
