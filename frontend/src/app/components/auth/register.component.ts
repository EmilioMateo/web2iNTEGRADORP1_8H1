import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './auth-form.component.css'
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  registerForm = this.fb.nonNullable.group({
    correo: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    confirmPassword: ['', Validators.required]
  }, { validators: this.passwordsMatchValidator });

  isLoading = false;
  errorMsg = '';
  successMsg = '';
  submitted = false;
  invalidField: 'correo' | 'password' | 'confirmPassword' | null = null;
  showTermsModal = true;
  termsAccepted = false;

  terms = [
    {
      title: 'Uso de la plataforma',
      text: 'La plataforma funciona como una tienda virtual especializada en la venta de maquinas, accesorios y equipo de gimnasio, dirigida a usuarios de home gym, gimnasios independientes y clientes interesados en productos fitness. Al acceder, registrarse o realizar una compra dentro de la plataforma, el usuario acepta los presentes terminos y condiciones.'
    },
    {
      title: 'Cuenta y seguridad',
      text: 'Para crear una cuenta, el usuario debera proporcionar informacion valida, incluyendo un correo electronico activo. El usuario es responsable de mantener protegidas sus credenciales de acceso y de no compartir su contrasena con terceros. La plataforma implementara mecanismos de autenticacion y proteccion de contrasenas mediante funciones hash. En caso de detectar accesos no autorizados, intentos de vulneracion o uso indebido de una cuenta, la plataforma podra bloquear temporalmente el acceso o tomar medidas de seguridad adicionales.'
    },
    {
      title: 'Catalogo de productos',
      text: 'Los productos se mostraran dentro de un catalogo digital con informacion como nombre, precio, descripcion, imagen, categoria, disponibilidad y caracteristicas generales. La plataforma procurara mantener actualizada la informacion del catalogo. Sin embargo, la disponibilidad de productos puede variar por cambios de inventario, retrasos de proveedores, errores de sistema o alta demanda. Las imagenes son de caracter ilustrativo y pueden presentar diferencias menores respecto al producto final entregado.'
    },
    {
      title: 'Compras, pagos y pedidos',
      text: 'Las compras podran realizarse mediante el carrito de compras y las pasarelas de pago integradas. Todo pedido estara sujeto a validacion de datos, confirmacion de pago y existencia de inventario. La compra se considerara confirmada unicamente cuando el pago haya sido aprobado y el pedido haya sido registrado correctamente en el sistema. La plataforma podra cancelar, pausar o revisar un pedido en caso de errores en el precio, falta de inventario, problemas con el pago, datos incompletos o sospecha de uso indebido.'
    },
    {
      title: 'Precios y promociones',
      text: 'Los precios publicados podran cambiar sin previo aviso debido a variaciones de proveedores, costos de importacion, tipo de cambio, promociones temporales o ajustes comerciales. Las promociones estaran sujetas a vigencia, disponibilidad de productos y condiciones especificas indicadas dentro de la plataforma.'
    },
    {
      title: 'Envios y entregas',
      text: 'La entrega de los productos puede depender de proveedores, empresas de paqueteria, disponibilidad de stock, ubicacion del cliente y tipo de equipo adquirido. Debido al tamano y peso de algunas maquinas de gimnasio, ciertos productos pueden requerir condiciones especiales de traslado, maniobra, recepcion o instalacion. Los tiempos de entrega seran estimados y podran variar por causas externas.'
    },
    {
      title: 'Productos danados, incompletos o con retraso',
      text: 'En caso de recibir un producto incompleto, danado, defectuoso o en mal estado, el usuario debera reportarlo mediante los canales de atencion de la plataforma. El reporte debera incluir informacion del pedido, descripcion del problema y, cuando sea posible, evidencia como fotografias o videos del producto recibido. La plataforma dara seguimiento al caso con el proveedor o empresa de paqueteria correspondiente.'
    },
    {
      title: 'Cancelaciones, cambios y devoluciones',
      text: 'Las solicitudes de cancelacion, cambio o devolucion estaran sujetas al estado del pedido, condiciones del producto, tiempo transcurrido desde la entrega, politicas del proveedor y comprobante de compra. No podran aceptarse devoluciones de productos danados por mal uso, instalacion incorrecta, modificaciones no autorizadas, desgaste normal, golpes, humedad o uso distinto al recomendado.'
    },
    {
      title: 'Garantias',
      text: 'Los productos podran contar con garantia del fabricante, proveedor o vendedor, segun corresponda. La garantia podra cubrir defectos de fabricacion o fallas derivadas del funcionamiento normal del producto. La garantia no cubrira danos ocasionados por uso incorrecto, sobrecarga, instalacion inadecuada, falta de mantenimiento, modificaciones no autorizadas o uso contrario a las indicaciones del fabricante.'
    },
    {
      title: 'Uso responsable del equipo',
      text: 'El usuario reconoce que las maquinas y accesorios de gimnasio deben utilizarse de forma responsable, siguiendo manuales, advertencias de seguridad, instrucciones de instalacion y recomendaciones del fabricante. La plataforma no sera responsable por lesiones, accidentes o danos derivados del uso incorrecto del equipo, falta de supervision, instalacion inadecuada o uso distinto al recomendado.'
    },
    {
      title: 'Datos personales',
      text: 'Al registrarse o realizar una compra, el usuario autoriza el uso de sus datos personales para gestionar su cuenta, procesar pedidos, validar pagos, generar historial de compras, coordinar entregas y brindar atencion al cliente. La plataforma debera manejar esta informacion conforme a la legislacion aplicable en materia de proteccion de datos personales y poner a disposicion del usuario un aviso de privacidad.'
    },
    {
      title: 'Seguridad de la plataforma',
      text: 'La plataforma implementara medidas de seguridad para proteger la informacion de los usuarios, las credenciales de acceso, los pedidos y las transacciones realizadas. Sin embargo, ningun sistema digital puede garantizar seguridad absoluta. Por ello, la plataforma podra realizar actualizaciones, revisiones, pruebas y mejoras para reducir riesgos de accesos no autorizados, errores tecnicos o fallas operativas.'
    },
    {
      title: 'Disponibilidad del servicio',
      text: 'La plataforma podra recibir mantenimiento, pruebas, actualizaciones o mejoras para optimizar su rendimiento, seguridad, catalogo, pagos, inventario y experiencia de usuario. Durante estos procesos, algunas funciones podrian no estar disponibles temporalmente. La plataforma procurara reducir interrupciones, pero no garantiza disponibilidad continua o libre de errores.'
    },
    {
      title: 'Proveedores y empresas externas',
      text: 'La plataforma podra trabajar con proveedores, fabricantes, empresas de paqueteria y pasarelas de pago externas para completar la venta, entrega y gestion de los productos. Algunos retrasos, errores de entrega, fallas de stock o problemas de pago pueden depender de terceros. En estos casos, la plataforma dara seguimiento al problema, pero la solucion podra estar sujeta a los tiempos y politicas del proveedor correspondiente.'
    },
    {
      title: 'Propiedad intelectual',
      text: 'Los textos, imagenes, logotipos, diseno, estructura, interfaz y contenido de la plataforma pertenecen a sus respectivos titulares y no podran copiarse, modificarse, distribuirse o utilizarse sin autorizacion.'
    },
    {
      title: 'Modificaciones a los terminos',
      text: 'La plataforma podra modificar estos terminos y condiciones cuando sea necesario por cambios operativos, tecnicos, comerciales o legales. Las modificaciones estaran disponibles dentro de la plataforma y seran aplicables a partir de su publicacion.'
    },
    {
      title: 'Atencion al cliente',
      text: 'El usuario podra comunicarse con la plataforma para dudas, aclaraciones, problemas con pedidos, garantias, devoluciones, pagos o reportes relacionados con productos mediante los canales oficiales de atencion al cliente.'
    }
  ];

  private passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (!password || !confirmPassword) {
      return null;
    }

    return password === confirmPassword ? null : { passwordsMismatch: true };
  }

  private getErrorMessage(error: any): string {
    if (typeof error.error === 'string') {
      return error.error;
    }

    return error.error?.error || 'Error al registrar';
  }

  private markServerError(message: string): void {
    if (message.toLowerCase().includes('correo')) {
      this.invalidField = 'correo';
      this.registerForm.controls.correo.setErrors({ server: true });
      return;
    }

    if (message.toLowerCase().includes('contrasena')) {
      this.invalidField = 'confirmPassword';
      this.registerForm.controls.confirmPassword.setErrors({ server: true });
    }
  }

  acceptTerms(): void {
    this.termsAccepted = true;
    this.showTermsModal = false;
  }

  onSubmit(): void {
    this.submitted = true;
    this.invalidField = null;
    this.successMsg = '';

    if (!this.termsAccepted) {
      this.showTermsModal = true;
      this.errorMsg = 'Debes leer y aceptar los terminos y condiciones para crear una cuenta.';
      return;
    }

    if (this.registerForm.invalid) {
      if (this.registerForm.controls.correo.hasError('email') && this.registerForm.controls.correo.value) {
        this.errorMsg = 'El formato del correo no es valido.';
      } else if (this.registerForm.hasError('passwordsMismatch')) {
        this.errorMsg = 'Las contrasenas no coinciden.';
      } else if (
        this.registerForm.controls.correo.hasError('required') ||
        this.registerForm.controls.password.hasError('required') ||
        this.registerForm.controls.confirmPassword.hasError('required')
      ) {
        this.errorMsg = 'Todos los campos son obligatorios.';
      } else {
        this.errorMsg = 'Revisa los campos del formulario.';
      }

      this.registerForm.markAllAsTouched();
      this.invalidField = this.registerForm.controls.correo.invalid
        ? 'correo'
        : this.registerForm.controls.password.invalid
          ? 'password'
          : 'confirmPassword';
      return;
    }

    this.isLoading = true;
    this.errorMsg = '';

    this.authService.registerRequest(this.registerForm.getRawValue()).pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: () => {
        this.successMsg = 'El registro ha sido exitoso redirigiendo al login...';
        this.registerForm.disable();
        setTimeout(() => this.router.navigate(['/login']), 3000);
      },
      error: error => {
        this.isLoading = false;
        this.errorMsg = 'Error al registrar la cuenta. Verifica que los datos sean correctos o que el correo no este en uso.';
        this.markServerError(this.getErrorMessage(error));
        this.cdr.detectChanges();
      }
    });
  }
}
