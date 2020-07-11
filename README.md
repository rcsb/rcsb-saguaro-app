# rcsb-saguaro-app

RCSB Saguaro Web Application is an open-source library built on the top of the [RCSB Saguaro 1D Feature Viewer](https://rcsb.github.io/rcsb-saguaro)
and designed to display protein features at the [RCSB Web Site](https://www.rcsb.org). The package collects protein annotations from the 
[1D Coordinate Server](https://1d-coordinates.rcsb.org) and the main [RCSB Data API](https://data.rcsb.org) and generates preconfigures Protein 
Feature Summaries. The package allows access to RCSB Saguaro methods to add or change displayed data. 

<!---
<div id="pfvSelect" ></div>  
<div id="pfv" ></div>
<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/@bioinsilico/rcsb-saguaro-app@0.3.0/build/dist/app.js"></script>
<script type="text/javascript">RcsbFvWebApp.buildInstanceFv("pfv", "4Z35.A");</script>
--->

### Node Module Instalation
`npm install @bioinsilico/rcsb-saguaro-app`

### CDN JavaScript
`<script src="https://cdn.jsdelivr.net/npm/@bioinsilico/rcsb-saguaro-app@0.3.0/build/dist/app.js" type="text/javascript"></script>`

### JavaScript Examples
* [PDB Instance Chain View](https://rcsb.github.io/rcsb-saguaro-app/examples/instance.html)

The full collection of examples can be edit and modified at [CODEPEN](https://codepen.io/collection/XjrBRP?grid_type=list)

### Library Documentation
TypeScript classes documentation can be found [here](https://rcsb.github.io/rcsb-saguaro-app/globals.html).

### Main Class and Methods

- **RcsbFvWebApp.getRcsbFv**(elementId: string)
- **RcsbFvWebApp.buildUniprotFv**(elementId: string, upAcc: string)

- **RcsbFvWebApp.setBoardConfig**(boardConfigData: [RcsbFvBoardConfigInterface](https://rcsb.github.io/rcsb-saguaro/interfaces/rcsbfvboardconfiginterface.html))
- **RcsbFvWebApp.getRcsbFv**(elementId: string)
