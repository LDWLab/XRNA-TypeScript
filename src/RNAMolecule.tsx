import {Component} from 'react';

class RNAMolecule extends Component<React.SVGProps<SVGSVGElement>> {
  constructor(props : React.SVGProps<SVGSVGElement>) {
    super(props);
  }
  override render() {
    return <g transform="translate(0 10)">
      <text>
        Test
      </text>
    </g>
  }
}

export { RNAMolecule };