import {Component} from '@angular/core';
import {ToastController, AlertController, Loading, LoadingController} from 'ionic-angular';
import {Todo, TodoService} from '../../app/services/todo/todo';
import { SettingsProvider } from './../../providers/settings/settings';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  loader: Loading;
  todos: Todo[];
  selectedTheme: String;

  constructor(
    private todoService: TodoService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    private settings: SettingsProvider) {
    this.settings.setActiveTheme('light-theme');
    this.settings.getActiveTheme().subscribe(val => this.selectedTheme = val);
  }

  ngOnInit() {
    this.initLoader();
    this.loadTodos();
  }

  toggleAppTheme() {
    if (this.selectedTheme === 'dark-theme') {
      this.settings.setActiveTheme('light-theme');
    } else {
      this.settings.setActiveTheme('dark-theme');
    }
  }

  showInputAlert() {
    let prompt = this.alertCtrl.create({
      title: 'Додати',
      inputs: [{name: 'title', placeholder: 'Назва'}],
      buttons: [
        {text: 'Відміна'},
        {
          text: 'Додати',
          handler: data => {
            if (data.title !== "") {
              this.todoService.add(data.title, []).subscribe(
                response => {
                  let todo: Todo = {
                    name: data.title,
                    done: false,
                    tags: []
                  };
                  this.todos.unshift(todo)
                }
              );
            }
            else {
              this.presentToast("Неможливо додати порожній елемент")
            }
          }
        }
      ]
    });
    prompt.present();
  }

  updateItemState(evt: any, todo: Todo) {
    if (evt) {
      let index: number = this.todos.indexOf(todo);

      if (~index) {
        if (todo.done == true) {
          todo = this.todos[index]
          this.todos.splice(index, 1);
          this.todos.push(todo)
        }
        this.todoService.saveAll(this.todos).subscribe(
          done => {
            this.presentToast(
              "Елемент позначено як " + (todo.done ? "завершений" : "незавершений")
            )
          }
        );
      }
    }
  }

  private presentToast(message: string) {
    this.toastCtrl.create({message: message, duration: 2000}).present();
  }

  private initLoader() {
    this.loader = this.loadingCtrl.create({
      content: "Завантаження списку..."
    });
  }

  private loadTodos() {
    this.loader.present().then(() => {
      this.todoService.fetch().subscribe(
        data => {
          this.todos = data;
          this.loader.dismiss();
        }
      );
    })
  }

  deleteAll() {
    this.todos.length = 0;
    localStorage.clear();
    this.presentToast(
      "Список очищено");
  }

  deleteFinished() {
    if (this.todos.length !== 0) {
      for (let i = 0; i < this.todos.length; i++) {
        if (this.todos[i].done === true) {
          this.todos.splice(i);
          localStorage.setItem('todos', JSON.stringify(this.todos));
        }
      }
      this.presentToast(
        "Список завершених очищено");
    }
  }

  checkAllFinished() {
    if (this.todos.length !== 0) {
      for (let i = 0; i < this.todos.length; i++) {
        this.todos[i].done = true;
      }

      if (this.todos.length > 1) {
        this.presentToast(
          "Всі елементи позначено як завершені");
      }
      else {
        this.presentToast(
          "Елемент позначено як завершений");
      }
    }
    this.todos.push();
    this.todoService.saveAll(this.todos);
  }

  uncheckAllFinished() {
    if (this.todos.length !== 0) {
      for (let i = 0; i < this.todos.length; i++) {
        this.todos[i].done = false;
      }

      if (this.todos.length > 1) {
        this.presentToast(
          "Всі елементи позначено як незавершені");
      }
      else {
        this.presentToast(
          "Елемент позначено як незавершений");
      }
    }
    this.todos.push();
    this.todoService.saveAll(this.todos);
  }

  showDeleteAlert() {
    if (this.todos.length !== 0) {
      let prompt = this.alertCtrl.create({
        title: 'Видалити',
        buttons: [
          {
            text: 'Завершені',
            handler: data => {
              this.deleteFinished();
            }
          },
          {
            text: 'Всі',
            handler: data => {
              this.deleteAll();
            }
          },
          {text: 'Відміна'}
        ]
      });
      prompt.present();
    }
  }

}
