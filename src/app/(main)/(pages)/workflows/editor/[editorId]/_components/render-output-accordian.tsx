import { ConnectionProviderProps } from '@/providers/connections-provider'
import { EditorState } from '@/providers/editor-provider'
import { useFuzzieStore } from '@/store'
import React from 'react'
import ContentBasedOnTitle from './content-based-on-title'
import { EmailConfig } from './email-config'

type Props = {
  state: EditorState
  nodeConnection: ConnectionProviderProps
}

const RenderOutputAccordion = ({ state, nodeConnection }: Props) => {
  const {
    googleFile,
    setGoogleFile,
    selectedSlackChannels,
    setSelectedSlackChannels,
  } = useFuzzieStore()

  const renderContent = () => {
    switch (state.editor.selectedNode.data.type) {
      case 'Email':
        return <EmailConfig />
      default:
        return (
          <ContentBasedOnTitle
            nodeConnection={nodeConnection}
            newState={state}
            file={googleFile}
            setFile={setGoogleFile}
            selectedSlackChannels={selectedSlackChannels}
            setSelectedSlackChannels={setSelectedSlackChannels}
          />
        )
    }
  }

  return renderContent()
}

export default RenderOutputAccordion
