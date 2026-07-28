import { defineNitroPlugin } from 'nitropack/runtime';

export default defineNitroPlugin((nitro) => {
    // @ts-expect-error - custom hook from @xarenas107/nuxt-socket-io
    nitro.hooks.hook('io:server:done', (io: any) => {
        io.on('connection', (socket: any) => {
            console.log('[socket.io] 客户端已连接:', socket.id);

            socket.on('play-state-change', (data: any) => {
                console.log('[socket.io] 收到播放状态变化:', data);
                socket.broadcast.emit('play-state-change', data);
            });

            socket.on('time-sync', (data: any) => {
                console.log('[socket.io] 收到时间同步:', data);
                socket.broadcast.emit('time-sync', data);
            });

            socket.on('file-selected', (data: any) => {
                console.log('[socket.io] 收到文件选择:', data);
                socket.broadcast.emit('file-selected', data);
            });

            socket.on('ass-content-update', (data: any) => {
                console.log('[socket.io] 收到ASS内容更新');
                socket.broadcast.emit('ass-content-update', data);
            });

            socket.on('disconnect', () => {
                console.log('[socket.io] 客户端已断开:', socket.id);
            });
        });
    });
});
