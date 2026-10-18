import { createContext, useContext } from 'react'

export const RolesContext = createContext<Array<string>>([])

export const useIsShelterAdmin = () =>
  useContext(RolesContext).includes('Shelter_Admin')
