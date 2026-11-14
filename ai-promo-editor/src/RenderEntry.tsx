import React from 'react';
import {Composition,registerRoot,staticFile} from 'remotion';
import {ProjectComposition} from './LiveComposition';
import {totalFrames,type Project} from './core';
import example from '../examples/example-project.json';
const RenderProject:React.FC<{project:Project}>=({project})=><ProjectComposition project={project} mediaBaseUrl={staticFile('')}/>;
const Root=()=> <Composition id="SavedEditorProject" component={RenderProject} defaultProps={{project:example as Project}} durationInFrames={600} fps={30} width={1920} height={1080} calculateMetadata={({props}:{props:{project:Project}})=>({durationInFrames:totalFrames(props.project),fps:props.project.video.fps,width:props.project.video.width,height:props.project.video.height})}/>;
registerRoot(Root);

