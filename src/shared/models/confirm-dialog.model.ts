import * as dialogs from '@nativescript/core/ui/dialogs';

export interface IConfirmDialog {
    title: string;
    message: string;
    okButtonText: string;
    cancelButtonText: string;
}

export const showDialogConfirm = (payload: IConfirmDialog): Promise<boolean> => {
    return dialogs.confirm(payload);
};
