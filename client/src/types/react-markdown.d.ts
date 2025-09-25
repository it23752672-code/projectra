declare module 'react-markdown' {
  import * as React from 'react'

  export interface ReactMarkdownProps {
    children?: React.ReactNode
    className?: string
    // Commonly used props (minimal surface to satisfy TS usage in this project)
    skipHtml?: boolean
    linkTarget?: string | ((href: string, text: string) => string)
    transformLinkUri?: (uri: string, children?: React.ReactNode, title?: string) => string
    transformImageUri?: (uri: string, alt?: string, title?: string) => string
    remarkPlugins?: any[]
    rehypePlugins?: any[]
    components?: Record<string, React.ComponentType<any>>
  }

  const ReactMarkdown: React.FC<ReactMarkdownProps>
  export default ReactMarkdown
}
