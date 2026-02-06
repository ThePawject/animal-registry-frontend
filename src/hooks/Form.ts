import { createFormHook } from '@tanstack/react-form'

import {
  Select,
  SubscribeButton,
  TextArea,
  TextField,
} from '@/components/FormComponents'
import { fieldContext, formContext } from './FormContext'

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
