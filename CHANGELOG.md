# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v0.9.4](https://github.com/bicycle-codes/identity/compare/v0.9.1...v0.9.4)

* better `getDeviceName` function. Use a stateful class method instead of plain function.
* improve readme docs

## [v0.9.1](https://github.com/bicycle-codes/identity/compare/v0.9.0...v0.9.1)

### Fix

* Class properties + indexedDB keys
* better docs

## [v0.9.0](https://github.com/bicycle-codes/identity/compare/v0.8.2...v0.9.0)

### Breaking change 

Use a static method for `createDeviceRecord`, because it is conceptually better. You don't want to create a new "identity" when you are adding a new device to an existing Identity.

## [v0.8.2](https://github.com/bicycle-codes/identity/compare/v0.7.3...v0.8.2)

Breaking change -- factor out [odd](https://github.com/oddsdk/ts-odd) and [keystore-idb](https://github.com/fission-codes/keystore-idb).

### Merged

- Bump vite from 5.4.1 to 5.4.2 [`#173`](https://github.com/bicycle-codes/identity/pull/173)
- Bump @typescript-eslint/eslint-plugin from 8.1.0 to 8.2.0 [`#172`](https://github.com/bicycle-codes/identity/pull/172)
- Bump @typescript-eslint/parser from 8.1.0 to 8.2.0 [`#171`](https://github.com/bicycle-codes/identity/pull/171)
- Bump dorny/paths-filter from 2 to 3 [`#54`](https://github.com/bicycle-codes/identity/pull/54)
- Bump @typescript-eslint/parser from 8.0.1 to 8.1.0 [`#167`](https://github.com/bicycle-codes/identity/pull/167)
- Bump vite from 5.4.0 to 5.4.1 [`#169`](https://github.com/bicycle-codes/identity/pull/169)
- Bump @typescript-eslint/eslint-plugin from 8.0.1 to 8.1.0 [`#168`](https://github.com/bicycle-codes/identity/pull/168)
- Bump preact from 10.23.1 to 10.23.2 [`#166`](https://github.com/bicycle-codes/identity/pull/166)
- Bump route-event from 5.2.3 to 6.0.0 [`#165`](https://github.com/bicycle-codes/identity/pull/165)
- Bump zod from 3.22.4 to 3.23.8 [`#163`](https://github.com/bicycle-codes/identity/pull/163)
- Bump vite from 5.3.5 to 5.4.0 [`#164`](https://github.com/bicycle-codes/identity/pull/164)
- Bump typescript from 5.4.5 to 5.5.4 [`#160`](https://github.com/bicycle-codes/identity/pull/160)
- Bump @nichoth/components from 0.16.7 to 0.16.12 [`#161`](https://github.com/bicycle-codes/identity/pull/161)
- Bump @preact/signals from 1.2.3 to 1.3.0 [`#162`](https://github.com/bicycle-codes/identity/pull/162)
- Bump @typescript-eslint/eslint-plugin from 8.0.0 to 8.0.1 [`#159`](https://github.com/bicycle-codes/identity/pull/159)
- Bump @typescript-eslint/parser from 8.0.0 to 8.0.1 [`#158`](https://github.com/bicycle-codes/identity/pull/158)
- Bump @preact/preset-vite from 2.8.2 to 2.9.0 [`#155`](https://github.com/bicycle-codes/identity/pull/155)
- Bump uint8arrays from 5.0.3 to 5.1.0 [`#156`](https://github.com/bicycle-codes/identity/pull/156)
- Bump preact from 10.20.2 to 10.23.1 [`#157`](https://github.com/bicycle-codes/identity/pull/157)
- Bump postcss-nesting from 12.1.1 to 13.0.0 [`#153`](https://github.com/bicycle-codes/identity/pull/153)
- Bump vite from 5.2.9 to 5.3.5 [`#154`](https://github.com/bicycle-codes/identity/pull/154)

### Commits

- add a test for e2ee and it works! [`9c2b62a`](https://github.com/bicycle-codes/identity/commit/9c2b62a374bfb94957e7213a029f5c3ba069f968)
- rm dependencies [`55a4f55`](https://github.com/bicycle-codes/identity/commit/55a4f5514c7c2ee7b44b88a18f1651d2706a6bf7)
- update npm package-lock [`753c035`](https://github.com/bicycle-codes/identity/commit/753c035f7aa39a3464980bef514147165614568b)

## [v0.7.3](https://github.com/bicycle-codes/identity/compare/v0.7.2...v0.7.3) - 2024-08-05

### Merged

- Bump @typescript-eslint/eslint-plugin from 7.18.0 to 8.0.0 [`#152`](https://github.com/bicycle-codes/identity/pull/152)
- Bump partysocket from 1.0.1 to 1.0.2 [`#151`](https://github.com/bicycle-codes/identity/pull/151)
- Bump partykit from 0.0.107 to 0.0.108 [`#150`](https://github.com/bicycle-codes/identity/pull/150)
- Bump esbuild from 0.22.0 to 0.23.0 [`#149`](https://github.com/bicycle-codes/identity/pull/149)
- Bump esbuild from 0.21.5 to 0.22.0 [`#148`](https://github.com/bicycle-codes/identity/pull/148)
- Bump partykit from 0.0.105 to 0.0.107 [`#147`](https://github.com/bicycle-codes/identity/pull/147)
- Bump route-event from 4.2.27 to 5.2.2 [`#145`](https://github.com/bicycle-codes/identity/pull/145)
- Bump uuid from 9.0.1 to 10.0.0 [`#144`](https://github.com/bicycle-codes/identity/pull/144)
- Bump partykit from 0.0.104 to 0.0.105 [`#142`](https://github.com/bicycle-codes/identity/pull/142)
- Bump esbuild from 0.20.2 to 0.21.0 [`#141`](https://github.com/bicycle-codes/identity/pull/141)

### Commits

- use package-lock for CI [`feee8c1`](https://github.com/bicycle-codes/identity/commit/feee8c13d70e3de2353c3f758293a0112468c393)
- updates [`0ac99fe`](https://github.com/bicycle-codes/identity/commit/0ac99fe52fddbe6af89fdb178842857062680e11)
- fix lint [`abd2445`](https://github.com/bicycle-codes/identity/commit/abd24459334a41817a10f77e89549d2d496cf2a6)

## [v0.7.2](https://github.com/bicycle-codes/identity/compare/v0.7.1...v0.7.2) - 2024-04-20

### Commits

- fix crypto export [`3b08d89`](https://github.com/bicycle-codes/identity/commit/3b08d8943c0671c724a59c8987e3015503311935)

## [v0.7.1](https://github.com/bicycle-codes/identity/compare/v0.7.0...v0.7.1) - 2024-04-20

### Commits

- FIX: example [`fa8a7a5`](https://github.com/bicycle-codes/identity/commit/fa8a7a5af70b4175ed429ab673741c1b130c4b3d)
- FIX example [`0b3c8d6`](https://github.com/bicycle-codes/identity/commit/0b3c8d6de7b9d68d1f1560e1bc321992edd602aa)
- export crypto too [`340d62e`](https://github.com/bicycle-codes/identity/commit/340d62e981f7a7b92918553d152350b0c27a064b)

## [v0.7.0](https://github.com/bicycle-codes/identity/compare/v0.6.5...v0.7.0) - 2024-04-17

### Commits

- add "humanReadableName" property to devices [`db41e70`](https://github.com/bicycle-codes/identity/commit/db41e70857665ab60dbfa63d15021018166c1861)

## [v0.6.5](https://github.com/bicycle-codes/identity/compare/v0.6.4...v0.6.5) - 2024-04-17

### Merged

- Bump partykit from 0.0.103 to 0.0.104 [`#140`](https://github.com/bicycle-codes/identity/pull/140)

### Commits

- better docs [`a074efa`](https://github.com/bicycle-codes/identity/commit/a074efaf46f6dca7df1257eb330a1e0680c17b08)

## [v0.6.4](https://github.com/bicycle-codes/identity/compare/v0.6.3...v0.6.4) - 2024-04-17

### Commits

- better docs [`0c945ff`](https://github.com/bicycle-codes/identity/commit/0c945ffb639acd4313ca76f83a09e4aca1e40af5)

## [v0.6.3](https://github.com/bicycle-codes/identity/compare/v0.6.2...v0.6.3) - 2024-04-16

### Commits

- add tests for note to self [`61ce174`](https://github.com/bicycle-codes/identity/commit/61ce1746355da0b9625b8244aacbdaa4d8696e10)

## [v0.6.2](https://github.com/bicycle-codes/identity/compare/v0.6.1...v0.6.2) - 2024-04-16

### Commits

- better docs [`98c0b66`](https://github.com/bicycle-codes/identity/commit/98c0b66d75bb24d8265a8140e88c632787db5668)

## [v0.6.1](https://github.com/bicycle-codes/identity/compare/v0.6.0...v0.6.1) - 2024-04-16

### Merged

- Bump typescript from 5.4.4 to 5.4.5 [`#139`](https://github.com/bicycle-codes/identity/pull/139)
- Bump @typescript-eslint/eslint-plugin from 7.5.0 to 7.6.0 [`#136`](https://github.com/bicycle-codes/identity/pull/136)
- Bump @typescript-eslint/parser from 7.4.0 to 7.6.0 [`#137`](https://github.com/bicycle-codes/identity/pull/137)
- Bump preact from 10.20.1 to 10.20.2 [`#138`](https://github.com/bicycle-codes/identity/pull/138)
- Bump typescript from 5.4.3 to 5.4.4 [`#134`](https://github.com/bicycle-codes/identity/pull/134)
- Bump partykit from 0.0.102 to 0.0.103 [`#135`](https://github.com/bicycle-codes/identity/pull/135)
- Bump partykit from 0.0.101 to 0.0.102 [`#132`](https://github.com/bicycle-codes/identity/pull/132)
- Bump vite from 5.2.7 to 5.2.8 [`#133`](https://github.com/bicycle-codes/identity/pull/133)
- Bump @typescript-eslint/eslint-plugin from 7.3.1 to 7.5.0 [`#131`](https://github.com/bicycle-codes/identity/pull/131)
- Bump postcss-nesting from 12.1.0 to 12.1.1 [`#129`](https://github.com/bicycle-codes/identity/pull/129)
- Bump vite from 5.2.6 to 5.2.7 [`#128`](https://github.com/bicycle-codes/identity/pull/128)

### Commits

- wip [`0ca3e4c`](https://github.com/bicycle-codes/identity/commit/0ca3e4c8a4b76fb3673222efa01d5f0c7d3c52ee)
- fix gitignore [`921e2bd`](https://github.com/bicycle-codes/identity/commit/921e2bd70547a856f48e40eeab39bb9ff2693e85)
- it works. The base64 encoding was bad [`044342d`](https://github.com/bicycle-codes/identity/commit/044342dfbdd196a5edc407b0c8af44b7e62f953d)

## [v0.6.0](https://github.com/bicycle-codes/identity/compare/v0.5.0...v0.6.0) - 2024-03-26

### Merged

- Bump @typescript-eslint/parser from 7.3.1 to 7.4.0 [`#127`](https://github.com/bicycle-codes/identity/pull/127)
- Bump vite from 5.2.3 to 5.2.6 [`#123`](https://github.com/bicycle-codes/identity/pull/123)
- Bump @nichoth/components from 0.16.5 to 0.16.7 [`#124`](https://github.com/bicycle-codes/identity/pull/124)
- Bump preact from 10.20.0 to 10.20.1 [`#125`](https://github.com/bicycle-codes/identity/pull/125)
- Bump vite from 5.2.2 to 5.2.3 [`#122`](https://github.com/bicycle-codes/identity/pull/122)
- Bump @typescript-eslint/parser from 7.2.0 to 7.3.1 [`#115`](https://github.com/bicycle-codes/identity/pull/115)
- Bump partykit from 0.0.100 to 0.0.101 [`#120`](https://github.com/bicycle-codes/identity/pull/120)
- Bump typescript from 5.4.2 to 5.4.3 [`#121`](https://github.com/bicycle-codes/identity/pull/121)

### Commits

- change exports [`f4a1da4`](https://github.com/bicycle-codes/identity/commit/f4a1da4d995a267fa1a50d0aa3d80b776ab313fa)

## [v0.5.0](https://github.com/bicycle-codes/identity/compare/v0.4.7...v0.5.0) - 2024-03-26

### Commits

- change exports [`672ab26`](https://github.com/bicycle-codes/identity/commit/672ab26b1764fc7626c424a4e95467c0574bdc2c)

## [v0.4.7](https://github.com/bicycle-codes/identity/compare/v0.4.6...v0.4.7) - 2024-03-20

### Commits

- fix npm publish [`efd6d10`](https://github.com/bicycle-codes/identity/commit/efd6d1030276f9f18bf59cb9db7a5437275b7477)

## [v0.4.6](https://github.com/bicycle-codes/identity/compare/v0.4.5...v0.4.6) - 2024-03-20

## [v0.4.5](https://github.com/bicycle-codes/identity/compare/v0.4.4...v0.4.5) - 2024-03-20

### Commits

- fix registry [`05da6d2`](https://github.com/bicycle-codes/identity/commit/05da6d287cd37b5aacc47411fd71abe4e65bb64c)

## [v0.4.4](https://github.com/bicycle-codes/identity/compare/v0.4.3...v0.4.4) - 2024-03-20

### Merged

- Bump preact from 10.19.7 to 10.20.0 [`#117`](https://github.com/bicycle-codes/identity/pull/117)
- Bump vite from 5.1.6 to 5.2.2 [`#118`](https://github.com/bicycle-codes/identity/pull/118)
- Bump @preact/signals from 1.2.2 to 1.2.3 [`#119`](https://github.com/bicycle-codes/identity/pull/119)
- Bump @typescript-eslint/eslint-plugin from 7.2.0 to 7.3.1 [`#116`](https://github.com/bicycle-codes/identity/pull/116)
- Bump preact from 10.19.6 to 10.19.7 [`#113`](https://github.com/bicycle-codes/identity/pull/113)
- Bump @nichoth/routes from 4.0.5 to 4.0.7 [`#111`](https://github.com/bicycle-codes/identity/pull/111)
- Bump @ssc-half-light/util from 0.11.4 to 0.11.5 [`#112`](https://github.com/bicycle-codes/identity/pull/112)
- Bump partykit from 0.0.99 to 0.0.100 [`#114`](https://github.com/bicycle-codes/identity/pull/114)

### Commits

- inline sourcemap [`3f88320`](https://github.com/bicycle-codes/identity/commit/3f88320c1623751407d1e9c946391135d0f02dc8)
- rm that other publish script [`5137adb`](https://github.com/bicycle-codes/identity/commit/5137adb5ce7d93749d7d43abededafbf514e44dd)

## [v0.4.3](https://github.com/bicycle-codes/identity/compare/v0.4.2...v0.4.3) - 2024-03-20

### Commits

- inline sourcemap [`5fd55e4`](https://github.com/bicycle-codes/identity/commit/5fd55e42fd1f9779c6c49a5ef901c7b38d4cf70b)

## [v0.4.2](https://github.com/bicycle-codes/identity/compare/v0.4.1...v0.4.2) - 2024-03-16

### Commits

- update dependencies [`b27ae24`](https://github.com/bicycle-codes/identity/commit/b27ae245f9672d8cf9b4b0db49d3e97c415e5a83)

## [v0.4.1](https://github.com/bicycle-codes/identity/compare/v0.4.0...v0.4.1) - 2024-03-16

### Commits

- update docs [`a6c0e9a`](https://github.com/bicycle-codes/identity/commit/a6c0e9a1ee43f051b0a0032f161383209425cd02)

## [v0.4.0](https://github.com/bicycle-codes/identity/compare/v0.3.0...v0.4.0) - 2024-03-16

### Merged

- Bump @typescript-eslint/parser from 7.1.1 to 7.2.0 [`#106`](https://github.com/bicycle-codes/identity/pull/106)
- Bump @preact/preset-vite from 2.7.0 to 2.8.2 [`#110`](https://github.com/bicycle-codes/identity/pull/110)
- Bump esbuild from 0.20.1 to 0.20.2 [`#109`](https://github.com/bicycle-codes/identity/pull/109)
- Bump uint8arrays from 5.0.2 to 5.0.3 [`#108`](https://github.com/bicycle-codes/identity/pull/108)
- Bump @typescript-eslint/eslint-plugin from 7.1.0 to 7.2.0 [`#107`](https://github.com/bicycle-codes/identity/pull/107)
- Bump vite from 5.1.5 to 5.1.6 [`#105`](https://github.com/bicycle-codes/identity/pull/105)
- Bump postcss-nesting from 12.0.4 to 12.1.0 [`#102`](https://github.com/bicycle-codes/identity/pull/102)
- Bump typescript from 5.3.3 to 5.4.2 [`#103`](https://github.com/bicycle-codes/identity/pull/103)
- Bump partykit from 0.0.96 to 0.0.99 [`#104`](https://github.com/bicycle-codes/identity/pull/104)
- Bump @nichoth/debug from 0.6.6 to 0.6.7 [`#100`](https://github.com/bicycle-codes/identity/pull/100)
- Bump @nichoth/routes from 4.0.4 to 4.0.5 [`#101`](https://github.com/bicycle-codes/identity/pull/101)
- Bump @nichoth/debug from 0.6.5 to 0.6.6 [`#99`](https://github.com/bicycle-codes/identity/pull/99)
- Bump vite from 5.1.4 to 5.1.5 [`#96`](https://github.com/bicycle-codes/identity/pull/96)
- Bump @typescript-eslint/parser from 7.1.0 to 7.1.1 [`#98`](https://github.com/bicycle-codes/identity/pull/98)
- Bump partysocket from 1.0.0 to 1.0.1 [`#95`](https://github.com/bicycle-codes/identity/pull/95)

### Commits

- add utility methods [`029e29a`](https://github.com/bicycle-codes/identity/commit/029e29a7d46f2d9abccc36c10ddaafe8043c0f7f)

## [v0.3.0](https://github.com/bicycle-codes/identity/compare/v0.2.11...v0.3.0) - 2024-03-16

### Commits

- add utility methods [`4d6f745`](https://github.com/bicycle-codes/identity/commit/4d6f74512bcd4b7b9395d86d3d2a8b6cd8ac5080)
- add comments [`66b3ed7`](https://github.com/bicycle-codes/identity/commit/66b3ed7ca9f596dadf2317c884aedfae8cf16d36)
- fix capitalization in example [`adb39f3`](https://github.com/bicycle-codes/identity/commit/adb39f3fc2bc9d2afa7798ac5b2861008443e94b)

## [v0.2.11](https://github.com/bicycle-codes/identity/compare/v0.2.10...v0.2.11) - 2024-03-02

### Merged

- Bump @nichoth/routes from 4.0.3 to 4.0.4 [`#92`](https://github.com/bicycle-codes/identity/pull/92)
- Bump partykit from 0.0.94 to 0.0.96 [`#93`](https://github.com/bicycle-codes/identity/pull/93)

### Commits

- FIX: docs [`fb6fd8f`](https://github.com/bicycle-codes/identity/commit/fb6fd8fac77437f81351da55d80d0ea90449f5b0)
- better docs [`96b100d`](https://github.com/bicycle-codes/identity/commit/96b100df006595e9904332fa034c919b2633b9b3)

## [v0.2.10](https://github.com/bicycle-codes/identity/compare/v0.2.9...v0.2.10) - 2024-02-27

### Merged

- Bump partykit from 0.0.93 to 0.0.94 [`#90`](https://github.com/bicycle-codes/identity/pull/90)
- Bump postcss-nesting from 12.0.3 to 12.0.4 [`#91`](https://github.com/bicycle-codes/identity/pull/91)
- Bump route-event from 4.2.17 to 4.2.20 [`#87`](https://github.com/bicycle-codes/identity/pull/87)
- Bump partysocket from 0.0.21 to 1.0.0 [`#88`](https://github.com/bicycle-codes/identity/pull/88)
- Bump partykit from 0.0.92 to 0.0.93 [`#86`](https://github.com/bicycle-codes/identity/pull/86)
- Bump preact from 10.19.5 to 10.19.6 [`#84`](https://github.com/bicycle-codes/identity/pull/84)
- Bump partykit from 0.0.89 to 0.0.92 [`#85`](https://github.com/bicycle-codes/identity/pull/85)
- Bump @nichoth/components from 0.16.4 to 0.16.5 [`#82`](https://github.com/bicycle-codes/identity/pull/82)
- Bump vite from 5.1.3 to 5.1.4 [`#83`](https://github.com/bicycle-codes/identity/pull/83)
- Bump @nichoth/nanoid from 5.0.7 to 5.0.8 [`#80`](https://github.com/bicycle-codes/identity/pull/80)
- Bump postcss-nesting from 12.0.2 to 12.0.3 [`#81`](https://github.com/bicycle-codes/identity/pull/81)
- Bump preact from 10.19.4 to 10.19.5 [`#77`](https://github.com/bicycle-codes/identity/pull/77)
- Bump esbuild from 0.19.12 to 0.20.1 [`#78`](https://github.com/bicycle-codes/identity/pull/78)
- Bump @nichoth/debug from 0.6.1 to 0.6.5 [`#76`](https://github.com/bicycle-codes/identity/pull/76)
- Bump vite from 5.1.1 to 5.1.3 [`#75`](https://github.com/bicycle-codes/identity/pull/75)
- Bump @nichoth/routes from 4.0.1 to 4.0.3 [`#74`](https://github.com/bicycle-codes/identity/pull/74)

### Commits

- update lint, update partykit [`1ca95cc`](https://github.com/bicycle-codes/identity/commit/1ca95cc57519e43ba4086cc9c2d90802fd61e7cb)
- re-install [`220457b`](https://github.com/bicycle-codes/identity/commit/220457bbe30ac1c1e2644444d7f70952b334f900)

## [v0.2.9](https://github.com/bicycle-codes/identity/compare/v0.2.8...v0.2.9) - 2024-02-27

### Commits

- update lint, update partykit [`03fa3fd`](https://github.com/bicycle-codes/identity/commit/03fa3fda21512e0494cbe9ba97f69f475777ce9f)

## [v0.2.8](https://github.com/bicycle-codes/identity/compare/v0.2.7...v0.2.8) - 2024-02-13

### Commits

- use new namespace [`67397d6`](https://github.com/bicycle-codes/identity/commit/67397d655eeeba117613f9e1cccdfe48136e7126)

## [v0.2.7](https://github.com/bicycle-codes/identity/compare/v0.2.6...v0.2.7) - 2024-02-13

### Commits

- its broken [`a558abf`](https://github.com/bicycle-codes/identity/commit/a558abf3c2e343e894e1c46e20deef1669854dec)
- change imports now it works [`f751690`](https://github.com/bicycle-codes/identity/commit/f751690f2f0917d5f1005205670dd3405a9ccbc6)

## [v0.2.6](https://github.com/bicycle-codes/identity/compare/v0.2.5...v0.2.6) - 2024-02-13

### Merged

- Bump partykit from 0.0.84 to 0.0.89 [`#73`](https://github.com/bicycle-codes/identity/pull/73)
- Bump vite from 5.1.0 to 5.1.1 [`#71`](https://github.com/bicycle-codes/identity/pull/71)
- Bump uint8arrays from 5.0.1 to 5.0.2 [`#67`](https://github.com/bicycle-codes/identity/pull/67)
- Bump preact from 10.19.3 to 10.19.4 [`#68`](https://github.com/bicycle-codes/identity/pull/68)
- Bump route-event from 4.2.15 to 4.2.17 [`#66`](https://github.com/bicycle-codes/identity/pull/66)
- Bump vite from 5.0.12 to 5.1.0 [`#65`](https://github.com/bicycle-codes/identity/pull/65)
- Bump @typescript-eslint/parser from 6.20.0 to 6.21.0 [`#64`](https://github.com/bicycle-codes/identity/pull/64)
- Bump partykit from 0.0.81 to 0.0.84 [`#62`](https://github.com/bicycle-codes/identity/pull/62)
- Bump route-event from 4.1.10 to 4.2.15 [`#63`](https://github.com/bicycle-codes/identity/pull/63)
- Bump @nichoth/components from 0.16.2 to 0.16.4 [`#61`](https://github.com/bicycle-codes/identity/pull/61)
- Bump @nichoth/nanoid from 5.0.6 to 5.0.7 [`#60`](https://github.com/bicycle-codes/identity/pull/60)
- Bump @nichoth/components from 0.15.4 to 0.16.2 [`#59`](https://github.com/bicycle-codes/identity/pull/59)
- Bump partykit from 0.0.80 to 0.0.81 [`#58`](https://github.com/bicycle-codes/identity/pull/58)
- Bump @typescript-eslint/parser from 6.19.1 to 6.20.0 [`#57`](https://github.com/bicycle-codes/identity/pull/57)
- Bump partykit from 0.0.79 to 0.0.80 [`#56`](https://github.com/bicycle-codes/identity/pull/56)
- Bump partykit from 0.0.77 to 0.0.79 [`#53`](https://github.com/bicycle-codes/identity/pull/53)
- Bump esbuild from 0.19.11 to 0.19.12 [`#52`](https://github.com/bicycle-codes/identity/pull/52)
- Bump partykit from 0.0.75 to 0.0.77 [`#51`](https://github.com/bicycle-codes/identity/pull/51)
- Bump @typescript-eslint/parser from 6.19.0 to 6.19.1 [`#50`](https://github.com/bicycle-codes/identity/pull/50)
- Bump partykit from 0.0.73 to 0.0.75 [`#48`](https://github.com/bicycle-codes/identity/pull/48)
- Bump vite from 5.0.11 to 5.0.12 [`#46`](https://github.com/bicycle-codes/identity/pull/46)
- Bump partykit from 0.0.72 to 0.0.73 [`#45`](https://github.com/bicycle-codes/identity/pull/45)
- Bump partysocket from 0.0.20 to 0.0.21 [`#44`](https://github.com/bicycle-codes/identity/pull/44)
- Bump @typescript-eslint/parser from 6.18.0 to 6.19.0 [`#43`](https://github.com/bicycle-codes/identity/pull/43)

### Commits

- change package name [`48ac343`](https://github.com/bicycle-codes/identity/commit/48ac34358f4bca51413724e9d61a20b4b97d8e63)
- update routes [`1c96faa`](https://github.com/bicycle-codes/identity/commit/1c96faaa6784d88b4fcfcb68ae282b8ba2abb7f8)
- badge style [`198cb80`](https://github.com/bicycle-codes/identity/commit/198cb8042d82be60373ca1e2d7bf1ffdbb805838)

## [v0.2.5](https://github.com/bicycle-codes/identity/compare/v0.2.4...v0.2.5) - 2024-01-16

### Merged

- Bump partykit from 0.0.71 to 0.0.72 [`#42`](https://github.com/bicycle-codes/identity/pull/42)

### Commits

- change case of rootDid property [`4156204`](https://github.com/bicycle-codes/identity/commit/41562048ef8adb3239965bc3f959b9caf4738132)

## [v0.2.4](https://github.com/bicycle-codes/identity/compare/v0.2.3...v0.2.4) - 2024-01-16

### Commits

- change case of rootDid property [`b3c89d0`](https://github.com/bicycle-codes/identity/commit/b3c89d09e778439f1b17b8a0852b216b8cc030ec)

## [v0.2.3](https://github.com/bicycle-codes/identity/compare/v0.2.2...v0.2.3) - 2024-01-14

### Merged

- Bump partykit from 0.0.70 to 0.0.71 [`#41`](https://github.com/bicycle-codes/identity/pull/41)
- Bump partykit from 0.0.66 to 0.0.70 [`#40`](https://github.com/bicycle-codes/identity/pull/40)
- Bump @typescript-eslint/parser from 6.17.0 to 6.18.0 [`#38`](https://github.com/bicycle-codes/identity/pull/38)
- Bump partykit from 0.0.63 to 0.0.66 [`#37`](https://github.com/bicycle-codes/identity/pull/37)

### Commits

- style [`67da822`](https://github.com/bicycle-codes/identity/commit/67da822f3d3fb915a1c1a3b4fa1732f7baca5cd3)

## [v0.2.2](https://github.com/bicycle-codes/identity/compare/v0.2.1...v0.2.2) - 2024-01-14

### Merged

- Bump vite from 5.0.10 to 5.0.11 [`#35`](https://github.com/bicycle-codes/identity/pull/35)
- Bump partysocket from 0.0.19 to 0.0.20 [`#36`](https://github.com/bicycle-codes/identity/pull/36)
- Bump @nichoth/debug from 0.4.1 to 0.5.0 [`#34`](https://github.com/bicycle-codes/identity/pull/34)
- Bump @typescript-eslint/parser from 6.16.0 to 6.17.0 [`#29`](https://github.com/bicycle-codes/identity/pull/29)
- Bump partykit from 0.0.59 to 0.0.61 [`#28`](https://github.com/bicycle-codes/identity/pull/28)
- Bump partykit from 0.0.56 to 0.0.59 [`#27`](https://github.com/bicycle-codes/identity/pull/27)

### Commits

- update dependencies [`38678cd`](https://github.com/bicycle-codes/identity/commit/38678cd9e8716958c33f6acdce1a0b088c8365fe)
- style [`81df322`](https://github.com/bicycle-codes/identity/commit/81df3222bfd434003205c93a0840d99091dab4c1)
- fix import [`f4eea3d`](https://github.com/bicycle-codes/identity/commit/f4eea3d29f8e589783070d465d891f2c8cf65970)

## [v0.2.1](https://github.com/bicycle-codes/identity/compare/v0.2.0...v0.2.1) - 2023-12-31

### Commits

- better docs [`6be65ef`](https://github.com/bicycle-codes/identity/commit/6be65efe79ecd321bfff48e0d57e57e35f1a48d0)

## [v0.2.0](https://github.com/bicycle-codes/identity/compare/v0.1.27...v0.2.0) - 2023-12-31

### Commits

- add function `AddToGroup`, better docs [`15b9b24`](https://github.com/bicycle-codes/identity/commit/15b9b241018b831fee6deadf11437e3d1c13dd12)

## [v0.1.27](https://github.com/bicycle-codes/identity/compare/v0.1.26...v0.1.27) - 2023-12-30

### Merged

- Bump partykit from 0.0.55 to 0.0.56 [`#25`](https://github.com/bicycle-codes/identity/pull/25)
- Bump @nichoth/components from 0.15.2 to 0.15.4 [`#23`](https://github.com/bicycle-codes/identity/pull/23)
- Bump uint8arrays from 5.0.0 to 5.0.1 [`#24`](https://github.com/bicycle-codes/identity/pull/24)
- Bump partykit from 0.0.54 to 0.0.55 [`#22`](https://github.com/bicycle-codes/identity/pull/22)

### Commits

- better docs [`8cefcd3`](https://github.com/bicycle-codes/identity/commit/8cefcd3e17426454011e8f3076c41b873c9791fd)

## [v0.1.26](https://github.com/bicycle-codes/identity/compare/v0.1.25...v0.1.26) - 2023-12-30

### Commits

- better docs [`d7f95f7`](https://github.com/bicycle-codes/identity/commit/d7f95f7f6407c97c0523d0b83144213d20b25c6f)

## [v0.1.25](https://github.com/bicycle-codes/identity/compare/v0.1.24...v0.1.25) - 2023-12-26

### Merged

- Bump partykit from 0.0.50 to 0.0.54 [`#20`](https://github.com/bicycle-codes/identity/pull/20)
- Bump @typescript-eslint/parser from 6.15.0 to 6.16.0 [`#21`](https://github.com/bicycle-codes/identity/pull/21)

### Commits

- better npm scripts [`6782e80`](https://github.com/bicycle-codes/identity/commit/6782e80f24d06f4cf9106a80b39d637fdfca66a2)

## [v0.1.24](https://github.com/bicycle-codes/identity/compare/v0.1.23...v0.1.24) - 2023-12-26

### Commits

- better npm scripts [`a223bdb`](https://github.com/bicycle-codes/identity/commit/a223bdb6613d0c5051cdcf637938ce437f6f9238)

## [v0.1.23](https://github.com/bicycle-codes/identity/compare/v0.1.22...v0.1.23) - 2023-12-26

### Merged

- Bump typescript from 5.2.2 to 5.3.3 [`#17`](https://github.com/bicycle-codes/identity/pull/17)
- Bump postcss-nesting from 12.0.1 to 12.0.2 [`#18`](https://github.com/bicycle-codes/identity/pull/18)
- Bump partysocket from 0.0.17 to 0.0.18 [`#19`](https://github.com/bicycle-codes/identity/pull/19)

### Commits

- use @nichoth/debug [`d343313`](https://github.com/bicycle-codes/identity/commit/d3433130947419b7a47a1780e3fef22ca9e55fd1)
- fix package scripts [`406afa0`](https://github.com/bicycle-codes/identity/commit/406afa0723f11658135dbaed4390837b0e9328c4)
- better changelog script [`7548d3d`](https://github.com/bicycle-codes/identity/commit/7548d3d4e26e1f7a166d4dbb3f868cd3d89af5c5)

## [v0.1.22](https://github.com/bicycle-codes/identity/compare/v0.1.21...v0.1.22) - 2023-12-26

### Commits

- fix package scripts [`10da099`](https://github.com/bicycle-codes/identity/commit/10da09902142167c402fc67d75c5126dc86491f2)

## [v0.1.21](https://github.com/bicycle-codes/identity/compare/v0.1.20...v0.1.21) - 2023-12-26

### Commits

- use @nichoth/debug [`bcfbd7c`](https://github.com/bicycle-codes/identity/commit/bcfbd7c01c5bc52b7cf9f4d1a553a65902f93989)
- changelog [`4e91666`](https://github.com/bicycle-codes/identity/commit/4e91666ede81fd3fa85c98136007e9e367ea3390)
- better changelog script [`e0cea59`](https://github.com/bicycle-codes/identity/commit/e0cea5954b60266673354f80f633c9c91bcacf5f)

## [v0.1.20](https://github.com/bicycle-codes/identity/compare/v0.1.19...v0.1.20) - 2023-12-22

### Merged

- Bump partykit from 0.0.39 to 0.0.50 [`#14`](https://github.com/bicycle-codes/identity/pull/14)
- Bump esbuild from 0.19.8 to 0.19.10 [`#12`](https://github.com/bicycle-codes/identity/pull/12)
- Bump vite from 5.0.4 to 5.0.10 [`#11`](https://github.com/bicycle-codes/identity/pull/11)
- Bump @preact/signals from 1.2.1 to 1.2.2 [`#13`](https://github.com/bicycle-codes/identity/pull/13)
- Bump @nichoth/components from 0.15.1 to 0.15.2 [`#15`](https://github.com/bicycle-codes/identity/pull/15)

### Commits

- changelog [`9124bfc`](https://github.com/bicycle-codes/identity/commit/9124bfcd3a3ea4a9e43e25cbb36e1ac1aa7e4eb7)
- better docs [`f01e3e5`](https://github.com/bicycle-codes/identity/commit/f01e3e542e072e658bc49359a1f380a06593b7c9)

## [v0.1.19](https://github.com/bicycle-codes/identity/compare/v0.1.18...v0.1.19) - 2023-12-22

### Merged

- Bump actions/setup-node from 3 to 4 [`#5`](https://github.com/bicycle-codes/identity/pull/5)
- Bump preact from 10.19.2 to 10.19.3 [`#6`](https://github.com/bicycle-codes/identity/pull/6)
- Bump @nichoth/components from 0.13.3 to 0.15.1 [`#7`](https://github.com/bicycle-codes/identity/pull/7)
- Bump @typescript-eslint/parser from 5.62.0 to 6.15.0 [`#8`](https://github.com/bicycle-codes/identity/pull/8)
- Bump partysocket from 0.0.16 to 0.0.17 [`#9`](https://github.com/bicycle-codes/identity/pull/9)
- Bump uint8arrays from 4.0.9 to 5.0.0 [`#10`](https://github.com/bicycle-codes/identity/pull/10)

### Commits

- changelog [`d2b7258`](https://github.com/bicycle-codes/identity/commit/d2b72587a0f7a40e18169fb1242923321a40d7af)
- better docs [`76047cc`](https://github.com/bicycle-codes/identity/commit/76047cc1df80ce30f19d25cd8bae5430a0dfaf47)

## [v0.1.18](https://github.com/bicycle-codes/identity/compare/v0.1.17...v0.1.18) - 2023-12-21

### Commits

- better npm scripts [`f5ab436`](https://github.com/bicycle-codes/identity/commit/f5ab43639500c77efd76ca10c2f845dd2b7e36d7)

## [v0.1.17](https://github.com/bicycle-codes/identity/compare/v0.1.16...v0.1.17) - 2023-12-21

### Commits

- changelog [`f9dbc92`](https://github.com/bicycle-codes/identity/commit/f9dbc92ca72369550abb0e0bd7391cd44df20fca)
- postpublish script [`81ca3ef`](https://github.com/bicycle-codes/identity/commit/81ca3efe7e57b22b81300c8377ffecb2651a028f)

## [v0.1.16](https://github.com/bicycle-codes/identity/compare/v0.1.15...v0.1.16) - 2023-12-21

### Commits

- changelog [`ff9a134`](https://github.com/bicycle-codes/identity/commit/ff9a134e96583f5aca6d205027f8cd4491354cfd)
- add changelog [`15c62d5`](https://github.com/bicycle-codes/identity/commit/15c62d52bdaec5843eacc38f9d25d5db2af6b8ba)
- add dependabot and update action [`f042619`](https://github.com/bicycle-codes/identity/commit/f04261942fa4da559c33a923ab866ac5ebaa2789)

## [v0.1.15](https://github.com/bicycle-codes/identity/compare/v0.1.14...v0.1.15) - 2023-12-02

### Commits

- publish to npm registry also [`09e0b12`](https://github.com/bicycle-codes/identity/commit/09e0b127131e782d8884f529cf967e4e19bbab4a)

## [v0.1.14](https://github.com/bicycle-codes/identity/compare/v0.1.13...v0.1.14) - 2023-12-02

### Commits

- add private registry [`a195cac`](https://github.com/bicycle-codes/identity/commit/a195cac1289b4a008382177b5eea17c1577b0318)

## [v0.1.13](https://github.com/bicycle-codes/identity/compare/v0.1.12...v0.1.13) - 2023-12-02

### Commits

- add package-lock for CI [`2c403f6`](https://github.com/bicycle-codes/identity/commit/2c403f6a8cd5ed1285fa9fdd83787abe13ec11b5)
- update dependencies [`80cb017`](https://github.com/bicycle-codes/identity/commit/80cb0175d69faf5ea5ce12d79a74c135f325b703)
- fix example imports [`376c791`](https://github.com/bicycle-codes/identity/commit/376c791b440f7f35450be3f08f7f3f1c2f7fd73d)

## [v0.1.12](https://github.com/bicycle-codes/identity/compare/v0.1.11...v0.1.12) - 2023-11-19

### Commits

- update package scripts [`bc5a0cb`](https://github.com/bicycle-codes/identity/commit/bc5a0cb56970f6970052b6ae70a3e537d3104baa)

## [v0.1.11](https://github.com/bicycle-codes/identity/compare/v0.1.10...v0.1.11) - 2023-11-19

### Commits

- update dependencies, npm config [`f9bf7d6`](https://github.com/bicycle-codes/identity/commit/f9bf7d69e885f7a691396ba35add123522a9154e)
- add a badge [`240d06a`](https://github.com/bicycle-codes/identity/commit/240d06abc51dfaf961348849542803c835a773d2)

## [v0.1.10](https://github.com/bicycle-codes/identity/compare/v0.1.9...v0.1.10) - 2023-11-14

### Commits

- docs [`25bef07`](https://github.com/bicycle-codes/identity/commit/25bef07ea41d0df1ce3a2f6a104433bf84f17ebb)
- docs [`94fd14c`](https://github.com/bicycle-codes/identity/commit/94fd14c7eb7e54a8d7b2770e7394aaddb6c15255)

## [v0.1.9](https://github.com/bicycle-codes/identity/compare/v0.1.8...v0.1.9) - 2023-11-12

### Commits

- docs [`9b48613`](https://github.com/bicycle-codes/identity/commit/9b48613f93080dfc538ebc7109cb440978998f06)
- tweak [`1b79474`](https://github.com/bicycle-codes/identity/commit/1b7947410b9e84b65c2e59deb9f99e0522295a93)
- badges [`b24895e`](https://github.com/bicycle-codes/identity/commit/b24895e84d292eaff5fd7bcf4d081cbc163cfdb5)

## [v0.1.8](https://github.com/bicycle-codes/identity/compare/v0.1.7...v0.1.8) - 2023-11-09

### Commits

- docs [`f0379df`](https://github.com/bicycle-codes/identity/commit/f0379dfd6ccb8d2acd01538eca1fa2f3e78a1272)
- docs [`6eea0c3`](https://github.com/bicycle-codes/identity/commit/6eea0c38768e125f0c8250b01bc51250e434dc8f)
- add badges [`98f1e47`](https://github.com/bicycle-codes/identity/commit/98f1e479afc28ef3de849f840f22f06e74f43650)

## [v0.1.7](https://github.com/bicycle-codes/identity/compare/v0.1.6...v0.1.7) - 2023-11-08

### Commits

- docs [`f6ec760`](https://github.com/bicycle-codes/identity/commit/f6ec760059661d868666ab4b13dc412e774c084e)
- update docs [`24ead47`](https://github.com/bicycle-codes/identity/commit/24ead4701ad6f93cc7439fdf93c95be14e7a9479)
- docs [`e9a9630`](https://github.com/bicycle-codes/identity/commit/e9a963062c17f050e7079fa114001c17ae2b1c75)

## [v0.1.6](https://github.com/bicycle-codes/identity/compare/v0.1.5...v0.1.6) - 2023-11-07

### Commits

- docs [`f37d9ea`](https://github.com/bicycle-codes/identity/commit/f37d9ea826a27e150bddc4831c89b04b32a5b4ca)

## [v0.1.5](https://github.com/bicycle-codes/identity/compare/v0.1.4...v0.1.5) - 2023-11-07

### Commits

- docs [`1c5dea3`](https://github.com/bicycle-codes/identity/commit/1c5dea3dd95e53fb06caf4ab2efe4a0546ba9887)

## [v0.1.4](https://github.com/bicycle-codes/identity/compare/v0.1.3...v0.1.4) - 2023-11-07

### Commits

- spelling [`99b4c50`](https://github.com/bicycle-codes/identity/commit/99b4c501ca5491c333de6e68d966121ee047b415)

## [v0.1.3](https://github.com/bicycle-codes/identity/compare/v0.1.2...v0.1.3) - 2023-11-07

### Commits

- docs [`f5763ea`](https://github.com/bicycle-codes/identity/commit/f5763ead97117132f41ba7accde1e0539c4bb653)

## [v0.1.2](https://github.com/bicycle-codes/identity/compare/v0.1.1...v0.1.2) - 2023-11-07

### Commits

- rm obsolete package [`edd301e`](https://github.com/bicycle-codes/identity/commit/edd301e35de96f06aeef17550dae8c18bea22ab2)

## [v0.1.1](https://github.com/bicycle-codes/identity/compare/v0.1.0...v0.1.1) - 2023-11-07

### Commits

- add files [`e3b8cc7`](https://github.com/bicycle-codes/identity/commit/e3b8cc7bb2988481f07c6aa64f0ddfeb50583a30)

## [v0.1.0](https://github.com/bicycle-codes/identity/compare/v0.0.15...v0.1.0) - 2023-11-07

### Commits

- change to ntl [`8414d6f`](https://github.com/bicycle-codes/identity/commit/8414d6fc6b7a393674853dfcc2ee24886af706ef)
- commit package-lock [`464d53c`](https://github.com/bicycle-codes/identity/commit/464d53cc71d13f7f33d264b359381834517fb218)
- add package-lock for github CI [`87d255f`](https://github.com/bicycle-codes/identity/commit/87d255fdf69c917b38cfae945e20f926f14f0bdc)

## [v0.0.15](https://github.com/bicycle-codes/identity/compare/v0.0.14...v0.0.15) - 2023-11-02

### Commits

- fix build script for jsx [`efd7b4c`](https://github.com/bicycle-codes/identity/commit/efd7b4c736699e27a2db252905ff3b25bca34f02)

## [v0.0.14](https://github.com/bicycle-codes/identity/compare/v0.0.13...v0.0.14) - 2023-11-01

### Commits

- fix docs [`ede75ba`](https://github.com/bicycle-codes/identity/commit/ede75ba99ab59b06072c636dfd146ef71af15cf2)

## [v0.0.13](https://github.com/bicycle-codes/identity/compare/v0.0.12...v0.0.13) - 2023-10-31

### Commits

- license [`39a6c69`](https://github.com/bicycle-codes/identity/commit/39a6c69855e93cec79e5ec5032052524332aaa00)
- tweak [`1b55acd`](https://github.com/bicycle-codes/identity/commit/1b55acd2e4e529c7fea293c9447f78f2651d8467)

## [v0.0.12](https://github.com/bicycle-codes/identity/compare/v0.0.11...v0.0.12) - 2023-10-08

### Commits

- update build script [`c3676a8`](https://github.com/bicycle-codes/identity/commit/c3676a8e204bdcd40ddd17a62daeace3efeb2aa7)

## [v0.0.11](https://github.com/bicycle-codes/identity/compare/v0.0.10...v0.0.11) - 2023-10-08

### Commits

- fix CI [`29863f7`](https://github.com/bicycle-codes/identity/commit/29863f718a09af76fbd58fd9cdc4382d2092bada)
- add a build script [`3aaae75`](https://github.com/bicycle-codes/identity/commit/3aaae759830c0729cb1b05d56268a137f34eebe6)

## [v0.0.10](https://github.com/bicycle-codes/identity/compare/v0.0.9...v0.0.10) - 2023-10-07

### Commits

- update github CI [`9b7a2e4`](https://github.com/bicycle-codes/identity/commit/9b7a2e432b46bc5de11b3dbcb958ea40f72d3e13)
- fix deps and tests [`ec20c23`](https://github.com/bicycle-codes/identity/commit/ec20c23cb2106491326f1144900d17870780bc07)
- add preinstall script [`7d448fa`](https://github.com/bicycle-codes/identity/commit/7d448fa9abc852cc067ffbab9afccca9d745912e)

## [v0.0.9](https://github.com/bicycle-codes/identity/compare/v0.0.8...v0.0.9) - 2023-10-07

### Commits

- npmrc [`b0e2b79`](https://github.com/bicycle-codes/identity/commit/b0e2b793f4fcf49582545733233370d62ee3f9dc)

## [v0.0.8](https://github.com/bicycle-codes/identity/compare/v0.0.7...v0.0.8) - 2023-10-07

### Commits

- package publishing [`dee2d10`](https://github.com/bicycle-codes/identity/commit/dee2d106467dc0d1cbd4ff9b83ca2dfc925ea031)
- package [`9c26600`](https://github.com/bicycle-codes/identity/commit/9c26600562a0844f5d48f24991a4fc2a15a09829)

## [v0.0.7](https://github.com/bicycle-codes/identity/compare/v0.0.6...v0.0.7) - 2023-10-07

### Commits

- wip [`9149b98`](https://github.com/bicycle-codes/identity/commit/9149b98b966b0aec9d23f2d73789c84883134e6b)
- example works [`45d9af7`](https://github.com/bicycle-codes/identity/commit/45d9af7aaf99e805b7c703c75a370f0d29159921)
- example [`18b8974`](https://github.com/bicycle-codes/identity/commit/18b8974aea76ff5929db65c7b27eee828743d5a8)

## [v0.0.6](https://github.com/bicycle-codes/identity/compare/v0.0.5...v0.0.6) - 2023-09-25

### Commits

- fix encrypt string [`b76e976`](https://github.com/bicycle-codes/identity/commit/b76e97647c94c6340f5dd181e00e9c1445a2ee88)
- docs [`459b034`](https://github.com/bicycle-codes/identity/commit/459b034804bb2f884f20f509c7062d0edfdd3462)
- can decrypt a group message [`99eb96f`](https://github.com/bicycle-codes/identity/commit/99eb96fabd1d8b6e61b969c63538dfaddf2c77e5)

## [v0.0.5](https://github.com/bicycle-codes/identity/compare/v0.0.4...v0.0.5) - 2023-07-07

### Commits

- export encryptKey [`b8f564f`](https://github.com/bicycle-codes/identity/commit/b8f564f93beae685b6572e26e1f99d0d85d609e3)

## [v0.0.4](https://github.com/bicycle-codes/identity/compare/v0.0.3...v0.0.4) - 2023-07-07

### Commits

- WIP - better docs [`d0efc94`](https://github.com/bicycle-codes/identity/commit/d0efc94c0dacd9383976c4d88fdd99a6317d17e3)
- WIP [`06e262f`](https://github.com/bicycle-codes/identity/commit/06e262f6fc0f0353fe72a8796eb738fd5180a022)
- WIP [`278bc7e`](https://github.com/bicycle-codes/identity/commit/278bc7eb98e8052edafe83a8dbcc2448e77370ca)

## [v0.0.3](https://github.com/bicycle-codes/identity/compare/v0.0.2...v0.0.3) - 2023-06-26

### Commits

- some writing [`86a7993`](https://github.com/bicycle-codes/identity/commit/86a7993d66bd5b1fb93942af78a9d63060c34037)
- test passes [`55c5fd4`](https://github.com/bicycle-codes/identity/commit/55c5fd480e14c78aacfa892b2c4b280ef8330902)
- more docs [`e647696`](https://github.com/bicycle-codes/identity/commit/e6476969b223d2486fb2f6bc5ddd8629ccb25967)

## [v0.0.2](https://github.com/bicycle-codes/identity/compare/v0.0.1...v0.0.2) - 2023-05-24

### Commits

- add a dependency [`4639fda`](https://github.com/bicycle-codes/identity/commit/4639fdad3bf1dcf6492475e99446a410290cf943)

## v0.0.1 - 2023-05-24

### Commits

- Initial commit [`56656c5`](https://github.com/bicycle-codes/identity/commit/56656c5081c3b6bc9b6ac7b28890f6431724c302)
- docs and style [`03736e5`](https://github.com/bicycle-codes/identity/commit/03736e5fd5f03d42ed8ef274422dc7adb7d8447a)
- WIP [`626b840`](https://github.com/bicycle-codes/identity/commit/626b84006e80fbafc9371ff10b6bdc16a276730e)
