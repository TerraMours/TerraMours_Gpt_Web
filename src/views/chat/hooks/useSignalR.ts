import { onUnmounted, ref } from 'vue'
import { useMessage } from 'naive-ui'
import type { HubConnection } from '@microsoft/signalr'
import { HubConnectionBuilder } from '@microsoft/signalr'
import type { ImageRes } from '@/api'
import { useUserStore } from '@/store'

export function useSignalR(
  hubUrl: string,
) {
  const connection = ref<HubConnection | null>(null)
  const waitingCount = ref(0)
  const imgUrl = ref<ImageRes[]>([])
  const ms = useMessage()
  const userStore = useUserStore()

  const start = async () => {
    if (connection.value && connection.value.state === 'Connected')
      return
    connection.value = getConnection(hubUrl)
    if (connection.value) {
      // 连接 SignalR
      connection.value.start()
        .then(() => {
          // console.log('SignalR Connected.')
          // 调用 GraphGenerationHub 的 GetWaitingCount 方法获取队列等待数
          connection.value?.invoke('GetWaitingCount')
            .then((count) => {
              // console.log('Waiting Count:', count)
              waitingCount.value = count
            })
          // 注册 signalR 接收方法
          connection.value?.on('updateWaitingCount', (count) => {
            // console.log('Waiting Count:', count)
            waitingCount.value = count
          })
          connection.value?.on('updateImgUrl', (newImgUrl) => {
            // console.log('Waiting imgUrl:', newImgUrl)
            if (typeof newImgUrl === 'string') {
              ms.error(newImgUrl)
            }
            else {
              ms.success('图片生成成功。')
              imgUrl.value = newImgUrl.map((imagUrl: string) => ({ imagUrl })) as ImageRes[]
              userStore.refreshUserInfo()
            }
          })
        })
        .catch((error) => {
          console.log('SignalR Connection Error:', error)
        })
    }
  }

  const stop = () => {
    connection.value!.stop()
    connection.value = null
  }

  const getConnection = (
    hubUrl: string,
  ): HubConnection => {
    return new HubConnectionBuilder()
      .withUrl(hubUrl)
      .withAutomaticReconnect().build()
  }

  onUnmounted(() => {
    if (connection.value?.state === 'Connected')
      connection.value!.stop()
  })

  return {
    connection,
    waitingCount,
    imgUrl,
    start,
    stop,
  }
}
