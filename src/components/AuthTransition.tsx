import { motion } from 'framer-motion'
import { useAuth0 } from '@auth0/auth0-react'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { NoAccess } from './NoAccess'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { cn, getAuthorizationParams } from '@/lib/utils'
import { useMobile } from '@/hooks/useMobile'
import { defaultAnimalsParams, useAnimals } from '@/api/animals/queries'

interface AuthTransitionProps {
  authenticatedComponent: React.ReactNode
  userHasNoRoles?: boolean
}

export function AuthTransition({
  authenticatedComponent,
  userHasNoRoles,
}: AuthTransitionProps) {
  const { loginWithRedirect, isLoading, isAuthenticated } = useAuth0()
  const transitionDuration = 900
  const { isLoading: isAnimalTableLoading } = useAnimals(
    defaultAnimalsParams,
    !(userHasNoRoles || isLoading),
  )
  const { isMobile } = useMobile()

  if (isAuthenticated && !isAnimalTableLoading && !userHasNoRoles) {
    return <>{authenticatedComponent}</>
  }

  const showLogin = !isLoading && !isAuthenticated
  const showNoAccess = !isLoading && isAuthenticated && userHasNoRoles

  const shouldSpinnerAnimate = showLogin || showNoAccess

  return (
    <div className="relative min-h-screen overflow-hidden bg-white flex items-center justify-center">
      <div className="relative">
        <motion.div
          layout
          layoutId="spinner"
          initial={false}
          animate={{
            opacity: 1,
            x: shouldSpinnerAnimate ? (isMobile ? 0 : -150) : 0,
            y: shouldSpinnerAnimate ? (isMobile ? -200 : 0) : 0,
          }}
          transition={{
            duration: transitionDuration / 1000,
            ease: [0.8, 0, 0.2, 1],
          }}
        >
          <LoadingSpinner />
        </motion.div>

        <motion.div
          className={cn(
            'absolute',
            isMobile ? 'top-20 -left-10' : ' -top-8 left-[200px]',
          )}
          initial={{
            opacity: 0,
            x: isMobile ? 0 : 200,
          }}
          animate={{
            opacity: showLogin ? 1 : 0,
            x: showLogin ? (isMobile ? 0 : 0) : isMobile ? 0 : 200,
            y: showLogin ? (isMobile ? -200 : 0) : 0,
          }}
          exit={{ opacity: 1 }}
          transition={{
            duration: transitionDuration / 1000,
            delay: showLogin ? 0.2 : 0,
            ease: [0.8, 0, 0.2, 1],
          }}
        >
          <Card className="w-75 p-8 flex flex-col gap-2">
            <h2 className="text-2xl text-center font-semibold mb-4 text-emerald-800">
              Witaj z powrotem!
            </h2>
            <p className="text-lg mb-8 text-emerald-700 text-center">
              Zaloguj się, aby otrzymać dostęp do elektronicznego rejestru
              zwierząt.
            </p>
            <Button
              className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white"
              size="lg"
              onClick={() =>
                loginWithRedirect({
                  authorizationParams: getAuthorizationParams(),
                })
              }
              disabled={isLoading}
            >
              Zaloguj się
            </Button>
          </Card>
        </motion.div>
        <motion.div
          className={cn(
            'absolute',
            isMobile ? 'top-20 -left-10' : ' -top-26 left-[200px]',
          )}
          initial={{
            opacity: 0,
            x: isMobile ? 0 : 200,
          }}
          animate={{
            opacity: showNoAccess ? 1 : 0,
            x: showNoAccess ? (isMobile ? 0 : 0) : isMobile ? 0 : 200,
            y: showNoAccess ? (isMobile ? -200 : 0) : 0,
          }}
          exit={{ opacity: 1 }}
          transition={{
            duration: transitionDuration / 1000,
            delay: showNoAccess ? 0.2 : 0,
            ease: [0.8, 0, 0.2, 1],
          }}
        >
          <NoAccess />
        </motion.div>
      </div>
    </div>
  )
}
