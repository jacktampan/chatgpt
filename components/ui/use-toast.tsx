import { useState, useEffect } from 'react'

interface ToastProps {
  title: string
  description: string
  variant?: 'default' | 'destructive'
}

function Toast({ title, description, variant = 'default' }: ToastProps) {
  return (
    <div className={`fixed bottom-4 right-4 p-4 rounded-md shadow-lg ${
      variant === 'destructive' ? 'bg-red-500 text-white' : 'bg-white text-gray-900'
    }`}>
      <h3 className="font-bold">{title}</h3>
      <p>{description}</p>
    </div>
  )
}

export function toast(props: ToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  if (!isVisible) return null

  return <Toast {...props} />
}

