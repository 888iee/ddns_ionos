[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

<p align="center">
	<h1 align="center">IONOS DNS Record Updater</h1>
	<h3 align="center">Dynamic DNS for selfhosting</h3>
</p>

## About the Project
Since I selfhost stuff and my ISP changes my ipv4 regularly I need to update my DNS Records to point to my services. This node app checks every 2 minutes if your ip has changed and updates the dns record accordingly. So to say your own Dynamic DNS service.

## How to run
Clone this repo and cd into it.
```bash
	git clone git@github.com:888iee/ddns_ionos.git
	cd ./ddns_ionos
```

### Docker
```bash
	docker build . -t ddns_ionos
	docker run -d ddns_ionos
```

### Bare metal Node.js
```bash
	node ./app.js
```

## Disclaimer

Only IPv4 Adress was tested and I used node version 16.16 in development.  

## License
Distributed under the MIT License. See `LICENSE` for more information.
