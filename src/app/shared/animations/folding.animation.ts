import { animate, AnimationTriggerMetadata, state, style, transition, trigger } from '@angular/animations';

export function foldingAnimation(triggerName: string): AnimationTriggerMetadata {
  return trigger(triggerName, [
    state('true', style({
      overflow: 'hidden',
      height: '*'
    })),
    state('false', style({
      opacity: '0',
      overflow: 'hidden',
      height: '0'
    })),
    transition('1 => 0', animate('300ms ease-in-out')),
    transition('0 => 1', animate('300ms ease-in-out'))
  ]);
}
