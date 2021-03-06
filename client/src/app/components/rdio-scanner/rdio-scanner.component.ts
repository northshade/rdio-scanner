/*
 * *****************************************************************************
 * Copyright (C) 2019-2021 Chrystian Huot
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>
 * ****************************************************************************
 */

import { Component, ElementRef, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { RdioScannerConfig, RdioScannerEvent, RdioScannerLivefeedMode } from './rdio-scanner';
import { AppRdioScannerService } from './rdio-scanner.service';

@Component({
    selector: 'app-rdio-scanner',
    styleUrls: ['./rdio-scanner.component.scss'],
    templateUrl: './rdio-scanner.component.html',
})
export class AppRdioScannerComponent implements OnDestroy {
    private config: RdioScannerConfig | undefined;

    private eventSubscription = this.appRdioScannerService.event.subscribe((event: RdioScannerEvent) => this.eventHandler(event));

    private livefeedMode: RdioScannerLivefeedMode = RdioScannerLivefeedMode.Offline;

    @ViewChild('searchPanel') private searchPanel: MatSidenav | undefined;

    @ViewChild('selectPanel') private selectPanel: MatSidenav | undefined;

    constructor(
        private appRdioScannerService: AppRdioScannerService,
        private ngElementRef: ElementRef,
    ) { }

    @HostListener('window:beforeunload', ['$event'])
    exitNotification(event: BeforeUnloadEvent): void {
        if (this.livefeedMode !== RdioScannerLivefeedMode.Offline) {
            event.preventDefault();

            event.returnValue = 'Live Feed is ON, do you really want to leave?';
        }
    }

    start(): void {
        this.appRdioScannerService.startLivefeed();
    }

    stop(): void {
        this.appRdioScannerService.stopLivefeed();

        this.searchPanel?.close();
        this.selectPanel?.close();
    }

    ngOnDestroy(): void {
        this.eventSubscription.unsubscribe();
    }

    @HostListener('document:keydown.f', ['$event'])
    @HostListener('document:keydown.tab', ['$event'])
    toggleFullscreen(event?: KeyboardEvent): void {
        if (event && !this.config?.keyboardShortcuts) {
            return;
        }

        event?.preventDefault();

        if (document.fullscreenElement) {
            const el: {
                exitFullscreen?: () => void;
                mozCancelFullScreen?: () => void;
                msExitFullscreen?: () => void;
                webkitExitFullscreen?: () => void;
            } = document;

            if (el.exitFullscreen) {
                el.exitFullscreen();

            } else if (el.mozCancelFullScreen) {
                el.mozCancelFullScreen();

            } else if (el.msExitFullscreen) {
                el.msExitFullscreen();

            } else if (el.webkitExitFullscreen) {
                el.webkitExitFullscreen();
            }

        } else {
            const el = this.ngElementRef.nativeElement;

            if (el.requestFullscreen) {
                el.requestFullscreen();

            } else if (el.mozRequestFullScreen) {
                el.mozRequestFullScreen();

            } else if (el.msRequestFullscreen) {
                el.msRequestFullscreen();

            } else if (el.webkitRequestFullscreen) {
                el.webkitRequestFullscreen();
            }
        }
    }

    private eventHandler(event: RdioScannerEvent): void {
        if ('config' in event) {
            this.config = event.config;
        }

        if (event.livefeedMode) {
            this.livefeedMode = event.livefeedMode;
        }
    }

    @HostListener('document:keydown.arrowleft', ['$event'])
    private keyLeftArrow(event?: KeyboardEvent): void {
        if (event && !this.config?.keyboardShortcuts) {
            return;
        }

        event?.preventDefault();

        if (this.selectPanel?.opened) {
            this.selectPanel?.close();

        } else {
            this.searchPanel?.open();
        }
    }

    @HostListener('document:keydown.arrowright', ['$event'])
    private keyRightArrow(event?: KeyboardEvent): void {
        if (event && !this.config?.keyboardShortcuts) {
            return;
        }

        event?.preventDefault();

        if (this.searchPanel?.opened) {
            this.searchPanel?.close();

        } else {
            this.selectPanel?.open();
        }
    }
}
