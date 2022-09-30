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

[![Status budowy][badge2]][badge2url] [![Plakietka Weblate][badge6]][badge6url]
[![Pobrania przez GitHub][badge1]][badge1url] [![Plakietka Pi-Apps][badge3]][pi-apps]
[![Plakietka Pi-Ware][badge5]][pi-ware] [![Nieoficjalne repozytorium APT][badge4]][debian-repo]

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

[badge1]: https://img.shields.io/github/downloads/SpacingBat3/WebCord/total.svg?label=Pobrania&color=%236586B3
[badge1url]: https://github.com/SpacingBat3/WebCord/releases "Wydania"
[badge2]: https://img.shields.io/github/workflow/status/SpacingBat3/WebCord/Run%20tests?label=Budowanie&logo=github
[badge2url]: https://github.com/SpacingBat3/WebCord/actions/workflows/build.yml "Status budowy"
[badge3]: https://img.shields.io/endpoint?url=https%3A%2F%2Fwebcord-pi-apps-badge-sypgxsowx4mj.runkit.sh%2F
[pi-apps]: https://github.com/Botspot/pi-apps "Centrum otwartoźródłowych aplikacji dla Raspberry Pi OS. (GitHub)"
[badge4]: https://img.shields.io/endpoint?url=https%3A%2F%2Fwebcord-debian-badge-toklg87kjpyo.runkit.sh%2F
[pi-ware]: https://github.com/piware14/pi-ware "Alternatywa dla Pi-Apps. (GitHub)"
[badge5]: https://img.shields.io/endpoint?url=https%3A%2F%2Fwebcord-pi-apps-badge-sypgxsowx4mj.runkit.sh%2F%3Fbadge%3Dpi-ware&logo=data:image/png;base64,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
[debian-repo]: https://itai-nelken.github.io/Webcord_debian-repo/ "Nieoficjalne repozytorium Debiana (Strona domowa)"
[badge6]: https://hosted.weblate.org/widgets/webcord/pl/svg-badge.svg
[badge6url]: https://hosted.weblate.org/engage/webcord/ "Pomóż w tłumaczeniu WebCorda!"
[Sentry]: https://sentry.io "Narzędzie do monitorowania i śledzenia błędów w aplikacjach"
[Discord-Electron]: https://github.com/GyozaGuy/Discord-Electron "Aplikacja webowa dla Discoda zaprojektowana dla Linuksa"
[npm-docs]: https://docs.npmjs.com/cli/v7/configuring-npm/package-json#people-fields-author-contributors "Pola dla osób | Dokumentacja NPM"
[electron]: https://www.electronjs.org/ "Twórz aplikacje wieloplatformowe z wykorzystaniem JavaScript, HTML i CSS."
[electron-forge]: https://www.electronforge.io/ "Pełne narzędzie do tworzenia, publikowania i instalacji nowoczesnych aplikacji Electrona."
[license]: ../LICENSE "Licencja WebCorda"
[Fosscord]: https://fosscord.com "Wolna, otwartoźródłowa i możliwa do samodzielnego hostingu platforma dla czatu i rozmów kompatybilna z Discordem."
[discordapi]: https://discord.com/developers/docs/reference "Oficialna dokumentacja Discord REST API"
[chromiumbounty]: https://bughunters.google.com/about/rules/5745167867576320/chrome-vulnerability-reward-program-rules "Zasady programu nagradzania podatności w Chrome"
[Electron#Security]: https://www.electronjs.org/docs/latest/tutorial/security "Bezpieczeństwo | Dokumentacja Elektrona"