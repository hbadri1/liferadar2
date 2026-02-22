import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { IExtendedUser, NewExtendedUser } from '../extended-user.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IExtendedUser for edit and NewExtendedUserFormGroupInput for create.
 */
type ExtendedUserFormGroupInput = IExtendedUser | PartialWithRequiredKeyOf<NewExtendedUser>;

type ExtendedUserFormDefaults = Pick<NewExtendedUser, 'id' | 'active'>;

type ExtendedUserFormGroupContent = {
  id: FormControl<IExtendedUser['id'] | NewExtendedUser['id']>;
  fullName: FormControl<IExtendedUser['fullName']>;
  mobile: FormControl<IExtendedUser['mobile']>;
  avatar: FormControl<IExtendedUser['avatar']>;
  active: FormControl<IExtendedUser['active']>;
  user: FormControl<IExtendedUser['user']>;
};

export type ExtendedUserFormGroup = FormGroup<ExtendedUserFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class ExtendedUserFormService {
  createExtendedUserFormGroup(extendedUser: ExtendedUserFormGroupInput = { id: null }): ExtendedUserFormGroup {
    const extendedUserRawValue = {
      ...this.getFormDefaults(),
      ...extendedUser,
    };
    return new FormGroup<ExtendedUserFormGroupContent>({
      id: new FormControl(
        { value: extendedUserRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      fullName: new FormControl(extendedUserRawValue.fullName, {
        validators: [Validators.required, Validators.maxLength(120)],
      }),
      mobile: new FormControl(extendedUserRawValue.mobile, {
        validators: [Validators.maxLength(30)],
      }),
      avatar: new FormControl(extendedUserRawValue.avatar, {
        validators: [Validators.maxLength(255)],
      }),
      active: new FormControl(extendedUserRawValue.active, {
        validators: [Validators.required],
      }),
      user: new FormControl(extendedUserRawValue.user, {
        validators: [Validators.required],
      }),
    });
  }

  getExtendedUser(form: ExtendedUserFormGroup): IExtendedUser | NewExtendedUser {
    return form.getRawValue() as IExtendedUser | NewExtendedUser;
  }

  resetForm(form: ExtendedUserFormGroup, extendedUser: ExtendedUserFormGroupInput): void {
    const extendedUserRawValue = { ...this.getFormDefaults(), ...extendedUser };
    form.reset(
      {
        ...extendedUserRawValue,
        id: { value: extendedUserRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): ExtendedUserFormDefaults {
    return {
      id: null,
      active: false,
    };
  }
}
