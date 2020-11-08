<!-- @format -->

# G14Control Windows Desktop App

Pre-alpha sample styling:

![example image](https://i.ibb.co/WVDhjLb/g14control-electron-sample.png)

## Prerequisites

The `/electron` directory requires a `.env` file with two entries for the executables under `electron/atrofac-cli/` and `electron/ryzenadj/`. It should be structured as follows:

```
ATRO_LOC=<C:/path/to/atrofac-cli.exe>
RADJ_LOC=<C:/path/to/ryzenadj.exe>
CONFIG_LOC=<C:/path/to/electron/src/config.json>
```

## Dev Startup

> Requires at least node v14.8.0 (or at least that is what I am using during development)

There are two node packages, one in /electron, for the electron app, and one in the root directory, for the ReactJS UI.

In both, run `npm install` from your terminal of choice.

After installing, use two terminal windows, one in the root directory and one in /electron.

- In root terminal: `npm start`
- In /electron terminal: `npm run watch`

This should start a broken webpage, since it requires certain Electron functionality such as `window.IpcRenderer` for communication between the Electron backend and ReactJS frontend. The /electron terminal process will initialize as a functional Electron windowed application.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

### What Needs To Be Built...

This is just a starting list. I'm sure there is much more to do.

- Functionality for the electron tray icon similar to the original in G14ControlR3, but initially without G14Control preset plans.
- Main window styling and suggestions.
- Allow user to choose temperature polling time.
- Improved code commenting.
- FanCurve page front end logic -- the ipcRenderer listener functions under /electron are already built. \*_In progess_\*
  - ~~Atrofac command building.~~
  - ~~Integrating interactive draggable graph nodes on front end for building fan curve.~~
  - Persistent storage of commonly used fan curves that can be saved / edited / loaded from a configuration file. \*_In progess_\*
  - Command validation. \*_Mostly finished, but still in progess_\*
- Persistent storage for configuration and runtime events. \*_In progess_\*
  - ~~config.json file for configuration loaded into electron process & sent to react renderer process.~~
  - Saving / Editing / Adding configurations during runtime. \*_In progess_\*
- Status page design and relevent data to show.
  - Collect data from WMI & Windows PerformanceCounters such as BIOS version, ram, names of hardware vendors, important software versions, etc...
- Add settings page for more options such as "exit on window close" vs "run as icon app on window close", etc.
- Header main page custom exit and minimize buttons, as well as possible dropdown menu (could use this as a 'settings page')

  ...

- Eventually add G14Control plans configuration.

#### _dreams_

- Figure out how to directly control fans without needing to use atrofac-cli and preventing fan speed oscillation.

## License

[MIT](https://choosealicense.com/licenses/mit/)

## Major Contributors

https://github.com/thesacredmoocow/g14control-r2 (g14control's previous maintainer)

https://github.com/FlyGoat/RyzenAdj (adjusting tdp)

https://github.com/cronosun/atrofac (fan profiles)

- advanced cli configuration [documentation](https://github.com/cronosun/atrofac/blob/master/ADVANCED.md).
