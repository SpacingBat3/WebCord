<div align='right'>
<sub>
  You don't speak 🇵🇱️? <a href='../Readme.md'>Go back</a> to 🇬🇧️ docs.
</sub>
</div>
<div align='center'>
<a href='https://github.com/SpacingBat3/WebCord' title="Repozytorium GitHub'a dla projektu WebCord">
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

Internetowy klient dla usługi Discord i instancji [Fosscord], oparty o
[API Electron'a][electron] i rozwijany poprzez narzędzie
[Electron Forge][electron-forge]. W większości (jeżeli nie w pełni)
*wyprodukowany w Polsce* 🇵🇱️.

Poprzednio głównym celem powstania projektu WebCord było stworzenie działającego
klienta na platformy ARM, obecnie jednak jego rozwój skupiony jest na dążeniu do
bardziej prywatnej i bezpiecznej alternatywy oficjalnego klienta Discorda oraz
umożliwiającej użytkownikowi na wprowadzanie dowolnych zmian. Względem 
prywatności, w WebCordzie obecnie zaimplementowano poniższe funkcje:
  - blokowanie zbędnych usług firm trzecich, takie jak [Sentry][sentry],
  - blokowanie wybranych usług firm trzecich zintegrowanych z Discordem przez
    Politykę Bezpieczeństwa Treści (ang. *Content Security Policy*),
  - domyślne blokowanie śledzenia Discord'a poprzez anulowanie niektórych żądań API
    (`/science` i `/tracing`),
  - opcjonalne blokowanie wskaźnika pisania tekstu (`/typing`).

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
  - *[Dlaczego Electron?](../FAQ.md#4-why-electron)*
- [Przęłączniki linii poleceń / budowania aplikacji](../Flags.md)
  - [Przełączniki linii poleceń](../Flags.md#command-line-runtime-flags)
  - [Przełączniki budowania](../Flags.md#build-flags)
- [Udział w repozytorium](../Contributing.md)
- [Budowanie, pakowanie, testowanie i tworzenie plików dystrybucyjnych](Build.md)
  - [Instalacja zależności aplikacji](../Build.md#install-app-dependencies)
  - [Kompilacja i bezpośrednie uruchamianie aplikacji](../Build.md#compile-code-and-run-app-directly-without-packaging)
  - [*Linting* i sprawdzanie kodu](../Build.md#run-linter-and-validate-the-code)
  - [Pakowanie i tworzenie plików dystrybucyjnych](../Build.md#packaging-creating-distributables)
- [Struktura katalogowa kodu źródłowego](../Files.md)
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

## Chcesz pomóc w rozwoju aplikacji?

- Jeżeli chesz pomóc w usprawnieniach dotyczących kodu aplikacji, stwórz tzw.
  *Pull Request* i dodaj siebie do tablicy [`contributors`][npm-docs] w pliku
  `package.json`.

- Jeżeli chcesz stworzyć tłumaczenie dla aplikacji, polecam zapoznać się z
  dokumentem [Translate.md](../Translate.md).

Nigdy wcześniej nie stworzyłeś *Pull Request*'a? Koniecznie odwiedź
[poniższą stronę][makepr] (chyba że nie znasz języka angielskiego 😁️).

[badge1]: https://img.shields.io/github/package-json/dependency-version/SpacingBat3/WebCord/dev/electron?color=%236CB2BF&label=Electron
[badge2]: https://img.shields.io/github/downloads/SpacingBat3/WebCord/total.svg?label=Downloads&color=%236586B3
[badge3]: https://img.shields.io/github/workflow/status/SpacingBat3/WebCord/Run%20tests?label=Build&logo=github
[badge4]: https://img.shields.io/endpoint?url=https%3A%2F%2Fwebcord-pi-apps-badge-sypgxsowx4mj.runkit.sh%2F
[badge5]: https://img.shields.io/endpoint?url=https%3A%2F%2Fwebcord-debian-badge-toklg87kjpyo.runkit.sh%2F
[sentry]: https://sentry.io "Monitorowanie i śledzenie błędów aplikacji."
[discord-electron]: https://github.com/GyozaGuy/Discord-Electron "Aplikacja Electron'a dla Discorda zaprojektowana z myślą o systemach Linux."
[npm-docs]: https://docs.npmjs.com/cli/v7/configuring-npm/package-json#people-fields-author-contributors "Pola na temat ludzi | Dokumentacja NPM"
[makepr]: https://makeapullrequest.com/ "Utwórz Pull Request."
[electron]: https://www.electronjs.org/ "Twórz aplikacje wieloplatformowe w oparciu o Javascript, HTML i CSS."
[electron-forge]: https://www.electronforge.io/ "Środowisko dla tworzenia, publikowania i instalacji nowoczesnych aplikacji Eletron'a."
[license]: ../../LICENSE "Licencja WebCord."
[Fosscord]: https://fosscord.com "Darmowa, otwartoźródłowa i własnoręcznie hostowalna kompatybilna z Discord'em platforma dla rozmów tekstowych, głosowych i wideo."