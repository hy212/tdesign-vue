import _Radio from './radio';
import _Group from './group';
import RadioButton from './radio-button';
import mapProps from '../utils/map-props';
import setInstallFn from '../utils/setInstallFn';
import { TdRadioProps, TdRadioGroupProps } from '../../types/radio/TdRadioProps';

const Radio = mapProps(['checked'], { model: { prop: 'checked', event: 'change' } })(_Radio);
const RadioGroup = mapProps(['value'], { model: { prop: 'value', event: 'change' } })(_Group);

setInstallFn('Radio', Radio);
setInstallFn('RadioGroup', RadioGroup);
setInstallFn('RadioButton', RadioButton);

export * from '../../types/radio/TdRadioProps';

export type RadioProps = TdRadioProps;
export type RadioGroupProps = TdRadioGroupProps;

export {
  Radio,
  RadioGroup,
  RadioButton,
};

export default Radio;
