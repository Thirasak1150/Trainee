import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card'
import React from 'react'

const loadingaccountSetting = () => {
  return (
    <div className="flex justify-center items-center h-full overflow-hidden">
    <div className="w-full max-w-2xl p-4">
      <Card>
        <CardHeader>
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-md w-1/3 animate-pulse"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-2/3 animate-pulse mt-2"></div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-1/4 animate-pulse"></div>
            <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-md w-full animate-pulse"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-1/4 animate-pulse"></div>
            <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-md w-full animate-pulse"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-1/4 animate-pulse"></div>
            <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-md w-full animate-pulse"></div>
          </div>
        </CardContent>
        <CardFooter>
          <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-md w-32 animate-pulse"></div>
        </CardFooter>
      </Card>
    </div>
  </div>
  )
}

export default loadingaccountSetting