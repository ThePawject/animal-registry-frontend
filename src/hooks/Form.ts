import { createFormHook } from '@tanstack/react-form'

import { fieldContext, formContext } from './FormContext'
import {
  Select,
  SubscribeButton,
  TextArea,
  TextField,
} from '@/components/FormComponents'

export const { useAppForm } = createFormHook({
  fieldComponents: {
    TextField,
    Select,
    TextArea,
  },
  formComponents: {
    SubscribeButton,
  },
  fieldContext,
  formContext,
})
