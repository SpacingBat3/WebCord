<!--
  Jeżeli jesteś wstanie to przeczytać, to pewnie jedyne co tu zobaczysz poniżej, to jakaś
  niezrozumiała mieszanina tekstu i HTML. Dlatego dodałem do tego nieco "komentarzy",
  aby urozmaicić Ci czytanie tego w Notepadzie. Teraz jest to niezrozumiała mieszanina tekstu,
  HTML i irytujących komentarzy HTML ;).
 -->
<div align='right'>
<sub>
  You don't speak 🇵🇱️? <a href='../Readme.md'>Go back</a> to 🇬🇧️ docs.
</sub>
</div>
<div align='center'>
<a href='https://github.com/SpacingBat3/WebCord'> <img src='../../sources/assets/icons/app.png' width='192px'> </a> 
<h1>WebCord</h1>

<!--
                                 ______________________
                                /                      \ Ikonka stworzona przeze mnie
                                |                      | (NIE JEST KRADZIONA! :P)
                                |                      |
                                |     /--\____/--\     |
                                |    /   _    _   \    |
                                |   /   (_)  (_)   \   |
                                |  |     ______     |  |
                                |   \___/      \___/   |
                                |                      |
                                |                 \    |
                                \__________________\   |
                                                    \  |
                                                      \|
                                                        
						     
————————————————————————————————————— W e b C o r d —————————————————————————————————————

		       MIT • Electron • Pomoc mile widziana • Pi Apps • Repozytorium Debiana
-->

[![Licencja MIT](https://img.shields.io/github/license/SpacingBat3/WebCord?label=Licencja)](../../LICENSE)
[![Wydania GitHub](https://img.shields.io/github/release/SpacingBat3/electron-discord-webapp.svg?label=Wydania)](https://github.com/SpacingBat3/WebCord/tags)
[![Electron](https://img.shields.io/github/package-json/dependency-version/SpacingBat3/WebCord/dev/electron?color=%236CB2BF&label=Electron)](https://www.electronjs.org/)
[![Liczba pobrań](https://img.shields.io/github/downloads/SpacingBat3/electron-discord-webapp/total.svg?label=Pobrania&color=%236586B3)](https://github.com/SpacingBat3/releases)
[![Status budowania](https://img.shields.io/github/workflow/status/SpacingBat3/WebCord/Run%20tests?label=Budowanie&logo=github)](../../../actions/workflows/build.yml)
[![Pomoc mile widziana](https://img.shields.io/badge/Pomoc-mile%20widziana-brightgreen.svg)](#want-to-contribute-to-my-project)
[![Pi-Apps](https://badgen.net/badge/W%20Pi-Apps%3F/Tak!/c51a4a?icon=https://raw.githubusercontent.com/Botspot/pi-apps/master/icons/vector/logo.svg)](https://github.com/Botspot/pi-apps)
[![Nieoficjalne repozytorium Debiana](https://img.shields.io/endpoint?url=https%3A%2F%2Frunkit.io%2Fspacingbat3%2Fwebcord-debian-badge%2Fbranches%2Fmaster&label=Nieoficjalne)](https://itai-nelken.github.io/Webcord_debian-repo/)

</div>

<!-- ———————————————————————————————————————————————————————————————————————————————— -->

Internetowy klient Discord'a, oparty o [Electron API](https://github.com/electron/electron) i
rozwijany dzięki [Electron Forge](https://github.com/electron-userland/electron-forge).
W większości (jeżeli nie w pełni) *wyprodukowany w Polsce* 🇵🇱️.

WebCord stara się poprawiać (w stosunku do oficjalnego klienta) prywatność i bezpieczeństwo użytkownika poprzez
zezwolenie użytkownikowi na blokowanie dowolnych stron (posiadających integracje w Discord'dzie)
firm trzecich poprzez nadpisywanie nagłówka na taki, jaki został skonfigurowany poprzez ustawienia
aplikacji. WebCord blokuje również niektóre niepotrzebnie działające usługi, takie jak [Sentry](https://sentry.io).

Implementacja WebCorda znacznie różni się od wielu innych klientów stworzonych przez społeczność,
ponieważ nie jest to ani modyfikacja oficjalnego klienta, ani klient oparty o API Dicord'a (które
w domyśle jest wyłącznie do użytku przez boty) – zamiast tego wykorzystuje stronę internetową
Discorda, co w mojej opinii jest obecnie najbardziej sprawdzonym rozwiązaniem względem bezpieczeństwa
konta przed zablokowaniem. Dodatkowo WebCord podszywa się pod zwykłą przeglądarkę Chrome/Chromium
dzięki stosowaniu fałszywego *user agent*'a, co znacznie utrudnia odróżnienie użytkowników od tych
łączących się z Discord'em przez Chromium i zablokowaniem ich do dostępu do usługi (niestety, polityka
Discord'a sprawia, że ciężko jest stworzyć własny klient dla tej usługi, z uwagi na zagrożenie
związane z blokadą dostępu do konta przy wykorzystaniu API Discord'a).

Projekt ten początkowo był fork'iem [Discord-Electron](https://github.com/GyozaGuy/Discord-Electron),
ale w końcu później postanowiłem napisać go ponownie od zera jako projekt *Electron Discord Web App*,
którego nazwę zmieniłem na *WebCord* (aby nieco skrócić tą długą frazę 😉). Ponieważ jednak
[@GyozaGuy](https://github.com/GyozaGuy) stworzył swój własny projekt, miałem okazję sporo się nauczyć
na temat Electron'a oraz jak stworzyć przy jego pomocy klient Discorda. Dzięki pracy GyozaGuy,
ten projekt mógł w końcu samodzielnie się rozwijać.

## Dokumentacja (w większości jeszcze nie przetłumaczona!):
- [Lista funkcji WebCord'a](../Features.md)
- [Często zadawane pytania](../FAQ.md)
  - *[Który plik powinienem ściągnąć?](../FAQ.md#1-which-file-i-should-download)*
  - *[Treść nie wczytuje się prawidłowo...](../FAQ.md#2-imagevideocontent-does-not-load-properly-is-there-anything-i-can-do-about-it)*
  - *[Jak zezwolić na dostęp do mikrofonu?](../FAQ.md#3-how-to-get-a-microphone-permission-for-webcord)*
- [Konfiguracja aplikacji](../Settings.md)
  - [Automatyczne ukrywanie paska menu](../Settings.md#auto-hide-menu-bar)
  - [Wyłączanie funkcji ukrywania aplikacji do zasobnika systemowego](../Settings.md#disable-tray)
  - [Ukrywanie panelu bocznego Discord'a](../Settings.md#hide-side-bar)
  - [O ustawieniach CSP](../Settings.md#content-security-policy-settings)
  - [Przełączniki CLI](../Settings.md#cli-flags)
- [Udział w kodzie](../Contributing.md)
- [Tłumaczenie](../Translate.md)
- [Wspierane platformy](../Support.md)
- [Licencja](../../LICENSE)
- [Polityka prywatności](../Privacy.md)

## Licencja
Ten program upubliczniany jest na warunkach **[licencji MIT](../../LICENSE)**:
	
	Niniejszym udziela się bezpłatnego dostępu do obrotu kopią tego oprogramowania i
	powiązantymi z nią plikami dokumentacji (dalej nazywanymi: „Oprogramowaniem”)
	każdej osobie bez żadnych ograniczeń , włączając w to ograniczenia praw do
	wykorzystywania, kopiowania, modyfikowania, powielania, dystrybuowania, sublicencji
	i/lub sprzedarzy kopii Oprogramowania, a także zezwalania osobie, której Oprogramowanie
	zostało dostarczone, do czynienia tego samego, zastrzeżeniem następujących warunków:

	Powyższa nota zastrzegająca prawa autorskie oraz powyższa nota udzielająca uprawnień
	ma być uwzględniona w każdych kopiach bądź istotnych częściach Oprogramowania.

	OPROGRAMOWANIE JEST DOSTARCZANE „TAKIM JAKIM JEST”, BEZ JAKIEJKOLWIEK GWARANCJI,
	WYRAŹNEJ LUB DOROZUMIANEJ, WLICZAJĄC W TO GWARANCJĘ PRZYDATNOŚCI HANDLOWEJ LUB
	PRZYDATNOŚCI DO OKREŚLONYCH CELÓW A TAKŻE BRAKU WAD PRAWNYCH. W ŻADNYM WYPADKU
	TWÓRCA LUB POSIADACZ PRAW AUTORSKICH NIE MOŻE PONOSIĆ ODPOWIEDZIALNOŚCI Z TYTUŁU
	ROSZCZEŃ LUB WYRZĄDZONEJ SZKODY, A TAKŻE ŻADNEJ INNEJ ODPOWIEDZIALNOŚCI CZY TO
	WYNIKAJĄCEJ Z UMOWY, DELIKTU, CZY JAKIEJKOLWIEK INNEJ PODSTAWY POWSTAŁEJ W ZWIĄZKU
	Z OPROGRAMOWANIEM, UŻYTKOWANIEM GO LUB WPROWADZANIEM GO DO OBROTU.

<div align=right>

<sub> To jest wyłącznie tłumaczenie fragmentu licencji, <br>
które <strong> nie ma żadnej mocy prawnej </strong>. <br>
<a href='../../LICENSE'> Kliknij tutaj </a> aby wyświetlić oryginalną licencję. </sub>

</div>


## Chcesz pomóc w rozwoju aplikacji?

- Jeżeli chesz pomóc w usprawnieniach dotyczących kodu aplikacji, stwórz tzw. *Pull Request* i dodaj siebie
  do tablicy [`contributors`](https://docs.npmjs.com/cli/v7/configuring-npm/package-json#people-fields-author-contributors)
  w pliku `package.json`.

- Jeżeli chcesz stworzyć tłumaczenie dla aplikacji, polecam zapoznać się z
  dokumentem [Translate.md](../Translate.md).

Nigdy wcześniej nie stworzyłeś *Pull Request*'a? Sprawdź [tą (anglojęzyczną) stronę](https://makeapullrequest.com/).