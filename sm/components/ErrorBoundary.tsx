import React from 'react'

export default class ErrorBoundary extends React.Component<{children: React.ReactNode}, {error: Error | null}> {
  state = { error: null }

  componentDidCatch(error: Error, info: any) {
    console.log('=== ERROR CAUGHT ===')
    console.log(error.message)
    console.log(error.stack)
    console.log(info.componentStack)
  }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  render() {
    if (this.state.error) return null
    return this.props.children
  }
}