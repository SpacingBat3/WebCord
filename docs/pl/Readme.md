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

[![CodeQL][codeql-badge]][codeql-url] [![Status budowy][build-badge]][build-url]
[![Plakietka Weblate][l10nbadge]][l10n] [![Liczba pobrań][dlbadge]][downloads]
[![Serwer Discorda][discord-badge]][discord-url]

Internetowy klient dla usługi Discord i instancji [Fosscord], oparty o
[API Electron'a][electron] i rozwijany poprzez narzędzie
[Electron Forge][electron-forge]. W większości (jeżeli nie w pełni)
*wyprodukowany w Polsce* 🇵🇱️.

</div>

## Koncepty / główne funkcje

Współcześnie, WebCord (czyt. *łebkord*) jest dość skomplikowanym projektem;
można go podsumować jako paczkę funkcji skupionych na bezpieczeństwie programu i
prywatności użytkownika, reimplementacji funkcji oficjalnego Discorda, obejść
błędów Electrona / Chromium / Discorda, szablonów stylów, wewnętrznych stron i
*opakowanej* strony <https://discord.com>, projektując to wszystko z myślą o
zgodności z warunkami świadczenia usługi Discorda tak bardzo jak jest to możliwe
(lub sprytnym ukrywaniu zmian które mogą łamać te warunki z oczu Discorda). Dla
pełnego opisu funkcji, zapoznaj się z plikiem [Features.md](Features.md).

- 🕵️ **Wzmocniona prywaność**

WebCord robi wiele, aby poprawić prywatność użytkowników podczas korzystania z
Discorda. Tak jak wiele klientów, blokuje znane metody zbierania danych i
tworzenia odcisku palca pzreglądarki, ale nie kończy się to tylko na tym.
W przeciwieństwie do wielu innych rozwiązań, zarządza dostępem do mikrofonu i
kamery wewnątrz ustawień klienta, ustala własny *user agent* i ukrywa
modyfikacje standardowego API przeglądarki tak, aby nie można było odróżnić go
od prawdziwych przeglądarek Chrome/Chromium.

- 🛡️ **Skupiony na bezpieczeństwie**

Bazując na silniku Chromium i frameworku Electron, bezpieczeństwo WebCorda jest
takie samo na różnych platformach, nie bazując na bezpieczeństwie *natywnych*
przeglądarek. Dodatkowo Chromium posiada dobry
[program nagród dla osób złaszających podatności][chromiumbounty], który
**prawdopodobnie** jest najpopularniejszym programem tego typu wśród popularnych
silników przeglądarek. Sam Electron jest dba o bezpieczne ładowanie zdalnych
treści, wyodrębniając co najmniej skrypty przeglądarek od API Node'a dzięki
kompleksowej strukturze procesów przynależnych do aplikacji. Bezpieczeństwo
także zdecydowanie zapewnia restrykcyjna konfiguracja TypeScript i ESLint,
sprawdzająca jakość kodu względem ściśle ustalonych zasad, dzięki czemu wiele
błędów jest wykrywana i eliminowana zanim one dotrą do wersji oprogramowania dla
użytkownika końcowego. WebCord także podąża za praktykami wymienionymi na
stronie [Electron#Security]. Ten projekt stosuje również niektóre mechanizmy
zawarte w przeglądarkach, takie jak ochrona przed spamem okienek dialogowych
(`alert`/`prompt`) na wszelki wypadek gdyby Discord lub jego zależność zaczęła
zachowywać się szkodliwie i nieprzewidywalnie.

- 🛠️ **Modyfikowalny**

WebCord może być skonfigurowany do twoich potrzeb i preferencji – możesz ustawić
go tak, aby zapewniał jeszcze lepszą prywatność blokując strony firm trzecich w
ustawieniach Polityki Bezpieczeństwa Treści, polepszyć swoją prywatność poprzez
blokowanie wskaźnika pisania i wiele więcej! Dodatkowo, wszczepianie własnych
stylów jest w trakcie wprowadzania, umożliwiając tym samym na dostosowanie
wyglądu WebCorda tak, jak tylko to Tobie odpowiada!

- 📱 **Przyjazny dla urządzeń ARM i smartfonów z Linuksem**

Mimo iż Electron nie jest zaprojektowany do działania na urządzeniach mobilnych,
WebCord stara się dobrze wyświetlać nawet na urządzeniach z mniejszymi ekranami
i ekranami dotykowymi. Wciąż nie działa to idealnie, ale obecna implementacja
powinna wystaczyć do prostego korzystania z Discorda. Jednakże planuję kiedyś
zmienić ten stan rzeczy i pracować nad tym, aby WebCord wyglądał i funkcjonował
na urządzeniach mobilnych bardziej podobnie do oficjalnego klienta Discorda dla
systemu Android.

## Dokumentacja (w większości jeszcze nie przetłumaczona!):

Dla początkujących użytkowników zalecane jest co najmniej zapoznanie się z
[*Często zadawanymi pytaniami*](../FAQ.md) (aby naprawić często występujące
problemy z aplikacją i nie zgłaszać ich jako błędów). Możesz też zapoznać się z
[listą funkcji](../Features.md) aby wiedzieć, jakie funkcje są zaimplementowane
w aplikacji. Szczególnie zaleca się również zapoznanie się z
[licencją tego oprogramowania](../../LICENSE).

- [Lista funkcji WebCorda](../Features.md)
- [Repozytoria z WebCordem zarządzane przez społeczność](../Repos.md)
- [Często zadawane pytania](../FAQ.md)
  - *[Który plik powinienem ściągnąć?](../FAQ.md#1-which-file-i-should-download)*
  - *[Treść nie wczytuje się prawidłowo...](../FAQ.md#2-imagevideocontent-does-not-load-properly-is-there-anything-i-can-do-about-it)*
  - *[Jak zezwolić na dostęp do mikrofonu?](../FAQ.md#3-how-to-get-a-microphone-permission-for-webcord)*
  - *[Dlaczego Electron?](../FAQ.md#4-why-electron)*
  - *[Czy korzystanie z WebCorda łamie Warunki Świadczenia Usługi?](../FAQ.md#5-is-this-project-violating-discords-terms-of-service)*
- [Przęłączniki linii poleceń / budowania aplikacji](../Flags.md)
  - [Przełączniki linii poleceń](../Flags.md#command-line-runtime-flags)
  - [Przełączniki budowania](../Flags.md#build-flags)
- [Udział w repozytorium](../Contributing.md)
- [Budowanie, pakowanie, testowanie i tworzenie plików dystrybucyjnych](../Build.md)
  - [Instalacja zależności aplikacji](../Build.md#install-app-dependencies)
  - [Kompilacja i bezpośrednie uruchamianie aplikacji](../Build.md#compile-code-and-run-app-directly-without-packaging)
  - [*Linting* i sprawdzanie kodu](../Build.md#run-linter-and-validate-the-code)
  - [Pakowanie i tworzenie plików dystrybucyjnych](../Build.md#packaging-creating-distributables)
- [Struktura katalogowa kodu źródłowego](../Files.md)
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

Przeczytaj [`Contributing.md`](../Contributing.md), jeżeli znasz język angielski
– tłumaczy wiele w temacie pomocy w polepszaniu jakości WebCorda. W przypadku
niektórych czynności nie musisz być wcale obeznany z programowaniem!

[dlbadge]: https://img.shields.io/github/downloads/SpacingBat3/WebCord/total.svg?label=Pobrań&color=%236586B3
[downloads]: https://github.com/SpacingBat3/WebCord/releases "Wydania"
[build-badge]: https://img.shields.io/github/actions/workflow/status/SpacingBat3/WebCord/build.yml?label=Budowanie&logo=github&branch=master
[build-url]: https://github.com/SpacingBat3/WebCord/actions/workflows/build.yml "Status budowy"
[l10nbadge]: https://hosted.weblate.org/widgets/webcord/pl/svg-badge.svg
[l10n]: https://hosted.weblate.org/engage/webcord/pl/ "Pomóż przy tłumaczeniu WebCorda"
[Sentry]: https://sentry.io "Oprogramowanie do monitorowania aplikacji i śledzenia błędów"
[Discord-Electron]: https://github.com/GyozaGuy/Discord-Electron "Aplikacja Electrona stworzona z myślą o systemach z rodziny Linux."
[electron]: https://www.electronjs.org/ "Twórz aplikacje wieloplatformowe z wykorzystaniem JavaScript, HTML i CSS."
[electron-forge]: https://www.electronforge.io/ "Pełne narzędzie do tworzenia, publikowania i instalacji nowoczesnych aplikacji Electrona."
[license]: ../LICENSE "Licencja WebCorda"
[Fosscord]: https://fosscord.com "Wolna, otwartoźródłowa i możliwa do samodzielnego hostingu platforma dla czatu i rozmów kompatybilna z Discordem."
[discordapi]: https://discord.com/developers/docs/reference "Oficialna dokumentacja Discord REST API"
[chromiumbounty]: https://bughunters.google.com/about/rules/5745167867576320/chrome-vulnerability-reward-program-rules "Zasady programu nagradzania podatności w Chrome"
[Electron#Security]: https://www.electronjs.org/docs/latest/tutorial/security "Bezpieczeństwo | Dokumentacja Elektrona"
[codeql-badge]: https://img.shields.io/github/actions/workflow/status/SpacingBat3/WebCord/codeql-analysis.yml?label=Analiza&logo=github&logoColor=white&branch=master
[codeql-url]: https://github.com/SpacingBat3/WebCord/actions/workflows/codeql-analysis.yml "Status analizy CodeQL"
[discord-badge]: https://img.shields.io/discord/972965161721811026?color=%2349a4d3&label=Wsparcie&logo=discord&logoColor=white
[discord-url]: https://discord.gg/aw7WbDMua5 "Oficjalny serwer Discorda!"