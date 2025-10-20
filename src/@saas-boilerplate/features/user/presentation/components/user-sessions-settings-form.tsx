'use client'

import * as React from 'react'

import { Annotated } from '@/components/ui/annotated'
import { Clock12Icon, Trash2Icon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { api } from '@/igniter.client'
import {
  getDeviceIconByUserAgent,
  getDeviceInfoByUserAgent,
} from '../utils/get-device-icon-by-user-agent'
import { formatSessionExpiresAt } from '../utils/format-session-expires-at'
import { useAuth } from '@/@saas-boilerplate/features/auth/presentation/contexts/auth.context'

export function UserSessionsSettingsForm() {
  const auth = useAuth()
  const sessions = (api.session.findManyByCurrentUser as any).useQuery({}, {
    staleTime: 2 * 60 * 1000, // 2 minutos - sessões não mudam frequentemente
    cacheTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false, // Desabilita polling automático
  })

  return (
    <Annotated>
      <Annotated.Sidebar>
        <Annotated.Icon>
          <Clock12Icon className="w-4 h-4" />
        </Annotated.Icon>
        <Annotated.Title>Manage sessions</Annotated.Title>
        <Annotated.Description>
          Manage your active sessions in other browsers and devices.
        </Annotated.Description>
      </Annotated.Sidebar>
      <Annotated.Content>
        <Annotated.Section>
          <div className="merge-form-section">
            {sessions.loading && (
              <Skeleton className="w-full h-16 rounded-lg" />
            )}

            {!sessions.loading &&
              !sessions.error &&
              sessions.data?.length > 0 &&
              sessions.data.map(
                (session: {
                  userAgent: string
                  id: React.Key | null | undefined
                  token: string
                  expiresAt: Date
                }) => {
                  const device = getDeviceInfoByUserAgent(
                    session.userAgent as string,
                  )

                  return (
                    <div
                      key={session.id}
                      className="flex space-x-4 items-center justify-between py-4 text-sm"
                    >
                      {getDeviceIconByUserAgent(session.userAgent as string)}
                      <div className="flex-1 flex items-center space-x-4">
                        <div className="flex items-center gap-2">
                          {auth.session.session.token === session.token ? (
                            <h3 className="font-medium">Current session</h3>
                          ) : (
                            <h3 className="font-medium">Other device</h3>
                          )}
                          {device.isBot && (
                            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded">
                              Bot
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-muted-foreground">
                          <span className="font-medium">
                            {device.os} {device.osVersion}
                          </span>
                          <span>•</span>
                          <span>
                            {device.browser} {device.browserVersion}
                          </span>
                          <span>•</span>
                          <div>
                            Expires in{' '}
                            {formatSessionExpiresAt(session.expiresAt)}
                          </div>
                          <span>•</span>
                          <div>{device.device}</div>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        disabled={auth.session.session.token === session.token}
                      >
                        {auth.session.session.token === session.token
                          ? 'Current'
                          : 'End session'}
                        {auth.session.session.token !== session.token && (
                          <Trash2Icon />
                        )}
                      </Button>
                    </div>
                  )
                },
              )}
          </div>
        </Annotated.Section>
      </Annotated.Content>
    </Annotated>
  )
}
