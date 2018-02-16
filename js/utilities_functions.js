const canvas_anim_exported = new (function() {
    // set up
    this.canvas = document.getElementById('canvas-bg-anim');
    this.context = this.canvas.getContext('2d');

    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
    this.screen_bounds = () => { return { x : 0, y : 0, w : this.width, h : this.height }; };

    this.mouse = {
        x : -1, y : -1,
        is_defined() { return this.x != -1; }
    };

    this.clear_color = '#ffffff';

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
        }

        update(dt) {
            this.x += this.ax*dt*dt/2 + this.vx*dt;
            this.vx += this.ax*dt;

            this.y += this.ay*dt*dt/2 + this.vy*dt;
            this.vy += this.ay*dt;
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
    })

    // user setters
    this.set_update_cb = (f) => { this._update_cb = f; };
    this.set_draw_cb = (f) => { this._draw_cb = f; };
    this.set_resize_cb = (f) => { this._resize_cb = f; };

    this.set_clear_color = (c) => { this.clear_color = c; };

    // start coroutines
    this._update();
})();

console.log(canvas_anim_exported);