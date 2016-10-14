import _babel from "babel-core/register";
import _polyfill from "babel-polyfill";

import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";

import { AppModule } from "./app.module";

console.log(`babel-core=${_babel}, polyfill=${_polyfill}`);

platformBrowserDynamic().bootstrapModule(AppModule);
