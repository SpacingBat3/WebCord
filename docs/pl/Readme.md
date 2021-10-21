<div align='right'>
<sub>
  You don't speak 🇵🇱️? <a href='../Readme.md'>Go back</a> to 🇬🇧️ docs.
</sub>
</div>
<div align='center'>
<a href='https://github.com/SpacingBat3/WebCord' title="WebCord's GitHub Repository">
  <picture>
    <source srcset='https://raw.githubusercontent.com/SpacingBat3/WebCord/master/sources/assets/icons/app.png'>
    <img src='../../sources/assets/icons/app.png' height='192' alt="WebCord Logo">
  </picture>
</a>

# WebCord

[![Electron][badge1]][electron]
[![Liczba pobrań][badge2]](https://github.com/SpacingBat3/Webcord/releases "Wydania")
[![Status][badge3]](https://github.com/SpacingBat3/Webcord/actions/workflows/build.yml "Status budowania")
[![Pi-Apps][badge4]](https://github.com/Botspot/pi-apps "Centrum aplikacji otwartoźródłowych dla Raspberry Pi OS.")
[![Nieoficjalne repozytorium Debiana][badge5]](https://itai-nelken.github.io/Webcord_debian-repo/ "Nieoficjalne repozytorium WebCord dla Debian'a.")

</div>

Internetowy klient Discord'a, oparty o [Electron API][electron] i rozwijany
dzięki [Electron Forge][electron-forge]. W większości (jeżeli nie w pełni)
*wyprodukowany w Polsce* 🇵🇱️.

WebCord stara się poprawiać (w stosunku do oficjalnego klienta) prywatność i
bezpieczeństwo użytkownika poprzez zezwolenie użytkownikowi na blokowanie
dowolnych stron (posiadających integracje w Discord'dzie) firm trzecich poprzez
nadpisywanie nagłówka na taki, jaki został skonfigurowany poprzez ustawienia
aplikacji. WebCord blokuje również niektóre niepotrzebnie działające usługi,
takie jak [Sentry](https://sentry.io).

Implementacja WebCorda znacznie różni się od wielu innych klientów stworzonych
przez społeczność, ponieważ nie jest to ani modyfikacja oficjalnego klienta, ani
klient oparty o API Dicord'a (które w domyśle jest wyłącznie do użytku przez
boty) – zamiast tego wykorzystuje stronę internetową Discorda, co w mojej opinii
jest obecnie najbardziej sprawdzonym rozwiązaniem względem bezpieczeństwa konta
przed zablokowaniem. Dodatkowo WebCord podszywa się pod zwykłą przeglądarkę
Chrome/Chromium dzięki stosowaniu fałszywego *user agent*'a, co znacznie
utrudnia odróżnienie użytkowników od tych łączących się z Discord'em przez
Chromium i zablokowaniem ich do dostępu do usługi (niestety, polityka Discord'a
sprawia, że ciężko jest stworzyć własny klient dla tej usługi, z uwagi na
zagrożenie związane z blokadą dostępu do konta przy wykorzystaniu API Discord'a).

Projekt ten początkowo był fork'iem [Discord-Electron][discord-electron],
ale w końcu później postanowiłem napisać go ponownie od zera jako projekt
*Electron Discord Web App*, którego nazwę zmieniłem na *WebCord* (aby nieco
skrócić tą długą frazę 😉). Ponieważ jednak [@GyozaGuy](https://github.com/GyozaGuy)
stworzył swój własny projekt, miałem okazję sporo się nauczyć na temat
Electron'a oraz jak stworzyć przy jego pomocy klient Discorda. Dzięki pracy
GyozaGuy, ten projekt mógł w końcu samodzielnie się rozwijać.

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

## Strony Wiki

Z powodu, że **strony Wiki na GitHubie** tego projektu **zarządzane są przez**
**społeczność**, ich zawartość powinna być uważana za potencjalnie szkodliwe
źródło informacji. Zalecane jest w pierwszej kolejności zapoznanie się z
oficjalną dokumentacji przed przeglądaniem stron Wiki.

## Licencja
Ten program upubliczniany jest na warunkach **[licencji MIT][license]**:
	
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
<sub>

**Uwaga:** Wyłącznie plik [`LICENSE`][license] jest licencją oprogramowania.\
Ma on rozstrzygającą moc w przypadku konfliktu z treścią powyższego tekstu.

</sub>
</div>


## Chcesz pomóc w rozwoju aplikacji?

- Jeżeli chesz pomóc w usprawnieniach dotyczących kodu aplikacji, stwórz tzw.
  *Pull Request* i dodaj siebie do tablicy [`contributors`][npm-docs] w pliku
  `package.json`.

- Jeżeli chcesz stworzyć tłumaczenie dla aplikacji, polecam zapoznać się z
  dokumentem [Translate.md](../Translate.md).

Nigdy wcześniej nie stworzyłeś *Pull Request*'a? Zobacz [tą stronę][makepr].

[badge1]: https://img.shields.io/github/package-json/dependency-version/SpacingBat3/WebCord/dev/electron?color=%236CB2BF&label=Electron
[badge2]: https://img.shields.io/github/downloads/SpacingBat3/electron-discord-webapp/total.svg?label=Downloads&color=%236586B3
[badge3]: https://img.shields.io/github/workflow/status/SpacingBat3/WebCord/Run%20tests?label=Build&logo=github
[badge4]: https://badgen.net/badge/Pi-Apps%3F/Yes!/c51a4a?icon=https%3A%2F%2Fraw.githubusercontent.com%2FBotspot%2Fpi-apps%2Fmaster%2Ficons%2Fvector%2Flogo.svg
[badge5]: https://img.shields.io/endpoint?url=https%3A%2F%2Frunkit.io%2Fspacingbat3%2Fwebcord-debian-badge%2Fbranches%2Fmaster
[sentry]: https://sentry.io "Monitorowanie i śledzenie błędów aplikacji"
[discord-electron]: https://github.com/GyozaGuy/Discord-Electron "Aplikacja Electron'a dla Discorda zaprojektowana z myślą o systemach Linux"
[npm-docs]: https://docs.npmjs.com/cli/v7/configuring-npm/package-json#people-fields-author-contributors "Pola na temat ludzi | Dokumentacja NPM"
[makepr]: https://makeapullrequest.com/ "Utwórz Pull Request"
[electron]: https://www.electronjs.org/ "Twórz aplikacje wieloplatformowe w oparciu o Javascript, HTML i CSS."
[electron-forge]: https://www.electronforge.io/ "Środowisko dla tworzenia, publikowania i instalacji nowoczesnych aplikacji Eletron'a."
[license]: ../../LICENSE "Licencja WebCord"