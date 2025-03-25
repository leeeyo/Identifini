import type React from "react"
import * as FaIcons from "react-icons/fa"
import type { IconBaseProps } from "react-icons"

// Create a type for all the icon names
type IconName = keyof typeof FaIcons

interface IconProps extends IconBaseProps {
  name: IconName
}

// Wrapper component that renders the icon by name
export const Icon: React.FC<IconProps> = ({ name, ...props }) => {
  const IconComponent = FaIcons[name]

  // Return the icon component with all props passed through
  return IconComponent ? <IconComponent {...props} /> : null
}


