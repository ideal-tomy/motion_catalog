import React from 'react';
import {registerRoot, Composition} from 'remotion';
import {Promo} from './Promo';
import plan from '../jobs/tournament-20261112/composition.json';
import rockPlan from '../jobs/tournament-rock-20261112/composition.json';
import {RockPromo} from './RockPromo';
import ddPlan from '../jobs/dd-rock-20261112/composition.json';
import {DdPromo} from './DdPromo';
import enPlan from '../jobs/tournament-rock-en-transitions-20261112/composition.json';
import {RockEnglishPromo,type EnglishPlan} from './RockEnglishPromo';
import {PremiumPromo} from './PremiumPromo';
import premiumPlan from '../jobs/dd-premium-20261112/composition.json';

const Root:React.FC=()=> <><Composition id="TournamentPromo" component={Promo} durationInFrames={600} fps={30} width={1920} height={1080} defaultProps={{plan}}/><Composition id="TournamentRock" component={RockPromo} durationInFrames={660} fps={30} width={1920} height={1080} defaultProps={{plan:rockPlan}}/><Composition id="DdRock" component={DdPromo} durationInFrames={660} fps={30} width={1920} height={1080} defaultProps={{plan:ddPlan}}/><Composition id="TournamentRockEnglish" component={RockEnglishPromo} durationInFrames={660} fps={30} width={1920} height={1080} defaultProps={{plan:enPlan as EnglishPlan}}/></>;
const StudioRoot:React.FC=()=> <><Root/><Composition id="DdPremium" component={PremiumPromo} durationInFrames={600} fps={30} width={1920} height={1080} defaultProps={{plan:premiumPlan}}/></>;
import {AtlasTournament,AtlasSingle} from './AtlasTournament';
import atlasPlan from '../jobs/atlas-reexport-tournament-20261113/composition.json';
const AtlasRoot:React.FC=()=> <><StudioRoot/><Composition id="AtlasTournament" component={AtlasTournament} durationInFrames={600} fps={30} width={1920} height={1080} defaultProps={{plan:atlasPlan}}/>{atlasPlan.scenes.map(scene=><Composition key={scene.id} id={scene.id.replace('-','')} component={AtlasSingle} durationInFrames={scene.endFrame-scene.startFrame} fps={30} width={1920} height={1080} defaultProps={{scene,theme:atlasPlan.theme}}/>)}</>;
registerRoot(AtlasRoot);
