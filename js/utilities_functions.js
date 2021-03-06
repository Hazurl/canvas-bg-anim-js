const canvas_anim_exported = new (function() {
    // set up
    this.canvas = document.getElementById('canvas-bg-anim');
    this.context = this.canvas.getContext('2d');

    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
    this.screen_bounds = () => { return { x : 0, y : 0, w : this.width, h : this.height }; };

    this.MOUSE_BUT_LEFT = 0;
    this.MOUSE_BUT_MIDDLE = 1;
    this.MOUSE_BUT_RIGHT = 2;

    this.mouse_buttons = [0, 0, 0];
    this.mouse = {
        x : -1, y : -1,
        is_defined() { return this.x != -1; }
    };

    this.clear_color = '#ffffff';
    this._clear_rect = true;

    this.start_time = Date.now() / 1000;
    this.time = 0;
    this.dt = 0;

    // classes
    this.Primitive = {};
    class Entity {
        constructor(x, y, vx = 0, vy = 0, ax = 0, ay = 0) {
            this.x = x;
            this.y = y;
            this.vx = vx;
            this.vy = vy;
            this.ax = ax;
            this.ay = ay;

            this.forces = new Map();
        }

        set_force(name, value) {
            this.forces.set(name, value);
        }

        update(dt) {
            let ax = this.ax;
            let ay = this.ay;
            for(let f of this.forces) {
                let [, [x, y]] = f;
                ax += x;
                ay += y;
            }
            this.x += ax*dt*dt/2 + this.vx*dt;
            this.vx += ax*dt;

            this.y += ay*dt*dt/2 + this.vy*dt;
            this.vy += ay*dt;
        }

        bounds() {
            return { x : this.x, y : this.y, w : 1, h : 1 };
        }

        keep_in_bounds(other) {
            let me = this.bounds();
            //console.log(other, me);
            if(me.x < other.x) {
                this.x += other.x - me.x;
                this.vx = -this.vx;
            } else if(me.x + me.w > other.x + other.w) {
                this.x += (other.x + other.w) - (me.x + me.w);
                this.vx = -this.vx;                
            }
            if(me.y < other.y) {
                this.y += other.y - me.y;
                this.vy = -this.vy;
            } else if(me.y + me.h > other.y + other.h) {
                this.y += (other.y + other.h) - (me.y + me.h);
                this.vy = -this.vy;                
            }
        }
    };

    class Circle extends Entity {
        constructor(x, y, radius, color, filled = true, weight = 1) {
            super(x, y);
            this.radius = radius;
            this.color = color;
            this.filled = filled;
            this.stroke = weight;
        }

        draw(cvs, ctx) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, 2*Math.PI);
            if (this.filled) {
                ctx.fillStyle = this.color;
                ctx.fill();
            } else {
                ctx.strokeStyle = this.color;
                ctx.lineWidth = this.stroke;
                ctx.stroke();
            }
        }

        bounds() {
            return { x : this.x - this.radius, y : this.y - this.radius, w : this.radius * 2, h : this.radius * 2 };
        }

    };

    this.Primitive.Circle = Circle;
    this.Primitive.Entity = Entity;

    // events, coroutines...
    this._update = () => {
        requestAnimationFrame(this._update);

        let t = Date.now() / 1000;
        this.dt = (t - this.start_time) - this.time;
        this.time = t - this.start_time;

        if (this._update_cb) this._update_cb(); 
        
        if (this._clear_rect)
        this.context.clearRect(0, 0, this.width, this.height);
        this.context.fillStyle = this.clear_color;
        this.context.fillRect(0, 0, this.width, this.height);
        
        if (this._draw_cb) this._draw_cb(); 
    };

    window.addEventListener('resize', () => {
        let old_w = this.width;
        let old_h = this.height;
        this.width = this.canvas.width = window.innerWidth;
        this.height = this.canvas.height = window.innerHeight;
        if (this._resize_cb) this._resize_cb(old_w, old_h, this.width, this.height);
    });

    window.addEventListener('mousemove', (e) => {
        this.mouse.x = e.x;
        this.mouse.y = e.y;
    }),

    document.body.addEventListener('mousedown', (e) => {
        if (this._button_down_cb && this.mouse_buttons[e.button] == 0) this._button_down_cb(e.button);
        this.mouse_buttons[e.button] = 1;
    });

    document.body.addEventListener('mouseup', (e) => {
        this.mouse_buttons[e.button] = 0;
        if (this._button_up_cb && this.mouse_buttons[e.button] == 0) this._button_up_cb(e.button);
    });

    // user setters
    this.set_update_cb = (f) => { this._update_cb = f; };
    this.set_draw_cb = (f) => { this._draw_cb = f; };
    this.set_resize_cb = (f) => { this._resize_cb = f; };
    this.set_button_up_cb = (f) => { this._button_up_cb = f; };
    this.set_button_down_cb = (f) => { this._button_down_cb = f; };

    this.set_clear_color = (c) => { this.clear_color = c; };
    this.use_clear_rect = (enable) => { this._clear_rect = enable; }

    // disable right click
    document.body.oncontextmenu= () => { return false; };

    // start coroutines
    this._update();
})();

console.log(canvas_anim_exported);