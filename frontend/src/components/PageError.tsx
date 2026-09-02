import { Link } from 'react-router'
import type { PageErrorAction } from '../types'

interface PageErrorProps {
  message: string
  action?: PageErrorAction
}

export function PageError({ message, action }: PageErrorProps) {
  return (
    <div
      className="rounded-box border border-base-300 bg-base-100 p-8 text-center"
      role="alert"
    >
      <p className="text-base-content/70">{message}</p>
      {action ? (
        <Link to={action.to} className="btn btn-primary btn-sm mt-4">
          {action.label}
        </Link>
      ) : null}
    </div>
  )
}
